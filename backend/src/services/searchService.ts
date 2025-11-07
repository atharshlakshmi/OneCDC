import { Shop, Catalogue, Item } from '../models';
import { SearchFilters, SortOption, PaginationOptions } from '../types';
import { calculateDistance, getDefaultLocation } from '../utils/distance';
import { AppError } from '../middleware';

/**
 * Helper function to append Google Maps API key to image URLs
 */
function appendApiKeyToImages(images: string[]): string[] {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !images) return images || [];

  return images.map(imageUrl => {
    if (!imageUrl) return imageUrl;
    // Check if the URL already has the key parameter
    if (imageUrl.includes('key=')) return imageUrl;
    // Append the API key
    return `${imageUrl}&key=${apiKey}`;
  });
}

/**
 * Helper function to capitalize category
 */
function capitalizeCategory(category: string | undefined): string | undefined {
  if (!category) return category;

  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .split('&')
    .map(word => word.trim().charAt(0).toUpperCase() + word.trim().slice(1))
    .join(' & ');
}

/**
 * Search for Items (Use Case #1-1)
 */
export const searchItems = async (
  filters: SearchFilters,
  sortBy: SortOption = SortOption.RELEVANCE,
  pagination: PaginationOptions = { page: 1, limit: 20 }
) => {
  const { query, category, availability, ownerVerified, location } = filters;
  const userLocation = location || getDefaultLocation();

  // Build aggregation pipeline
  const pipeline: any[] = [];

  // Match shops by filters - include shops without isActive field (for backward compatibility)
  const shopMatch: any = {};
  const activeConditions = [{ isActive: true }, { isActive: { $exists: false } }];

  if (category || ownerVerified !== undefined) {
    shopMatch.$and = [
      { $or: activeConditions }
    ];
    if (category) shopMatch.$and.push({ category });
    if (ownerVerified !== undefined) shopMatch.$and.push({ verifiedByOwner: ownerVerified });
  } else {
    shopMatch.$or = activeConditions;
  }

  pipeline.push({ $match: shopMatch });

  // Join with catalogues
  pipeline.push({
    $lookup: {
      from: 'catalogues',
      localField: '_id',
      foreignField: 'shop',
      as: 'catalogue',
    },
  });

  pipeline.push({ $unwind: '$catalogue' });
  pipeline.push({ $unwind: '$catalogue.items' });

  // Lookup Item documents
  pipeline.push({
    $lookup: {
      from: 'items',
      localField: 'catalogue.items',
      foreignField: '_id',
      as: 'item',
    },
  });

  pipeline.push({ $unwind: '$item' });

  // Filter items
  const itemMatch: any = {};
  if (query) {
    itemMatch.$or = [
      { 'item.name': { $regex: query, $options: 'i' } },
      { 'item.description': { $regex: query, $options: 'i' } },
    ];
  }
  if (availability !== undefined) {
    itemMatch['item.availability'] = availability;
  }

  if (Object.keys(itemMatch).length > 0) {
    pipeline.push({ $match: itemMatch });
  }

  // Calculate distance
  pipeline.push({
    $addFields: {
      distance: {
        $let: {
          vars: {
            lat: { $arrayElemAt: ['$location.coordinates', 1] },
            lng: { $arrayElemAt: ['$location.coordinates', 0] },
          },
          in: {
            $sqrt: {
              $add: [
                {
                  $pow: [
                    {
                      $subtract: [
                        '$$lat',
                        userLocation.lat,
                      ],
                    },
                    2,
                  ],
                },
                {
                  $pow: [
                    {
                      $subtract: [
                        '$$lng',
                        userLocation.lng,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
          },
        },
      },
    },
  });

  // Sort
  let sortStage: any = {};
  switch (sortBy) {
    case SortOption.DISTANCE:
      sortStage = { distance: 1 };
      break;
    case SortOption.ALPHABETICAL_ASC:
      sortStage = { 'item.name': 1 };
      break;
    case SortOption.ALPHABETICAL_DESC:
      sortStage = { 'item.name': -1 };
      break;
    default:
      sortStage = { distance: 1 };
  }
  pipeline.push({ $sort: sortStage });

  // Pagination
  const skip = (pagination.page - 1) * pagination.limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: pagination.limit });

  // Project final shape
  pipeline.push({
    $project: {
      shopId: '$_id',
      shopName: '$name',
      shopAddress: '$address',
      shopCategory: '$category',
      distance: 1,
      item: '$item',
      catalogueId: '$catalogue._id',
    },
  });

  const results = await Shop.aggregate(pipeline);

  // Append API key to item images and ensure each item has necessary fields
  const resultsWithApiKeys = results.map(result => ({
    ...result,
    item: {
      ...result.item,
      itemId: result.item?.name || '', // Use name as identifier
      catalogueId: result.catalogueId,
      category: capitalizeCategory(result.item?.category),
      images: appendApiKeyToImages(result.item?.images || [])
    }
  }));

  // Get total count
  const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, project
  countPipeline.push({ $count: 'total' });
  const countResult = await Shop.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  return {
    results: resultsWithApiKeys,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  };
};

/**
 * Search for Shops (Use Case #1-2)
 */
export const searchShops = async (
  filters: SearchFilters,
  sortBy: SortOption = SortOption.DISTANCE,
  pagination: PaginationOptions = { page: 1, limit: 20 }
) => {
  const { query, category, ownerVerified, openNow, location, maxDistance } =
    filters;
  const userLocation = location || getDefaultLocation();

  // Build query - include shops without isActive field (for backward compatibility)
  const queryObj: any = {
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  };

  if (query) {
    queryObj.$text = { $search: query };
  }
  if (category) {
    queryObj.category = category;
  }
  if (ownerVerified !== undefined) {
    queryObj.verifiedByOwner = ownerVerified;
  }

  // Find shops
  let shopsQuery = Shop.find(queryObj);

  // Get all shops to calculate distance
  const allShops = await shopsQuery.lean();

  // Calculate distances and filter
  const shopsWithDistance = allShops
    .map((shop) => {
      // Handle shops without location data
      if (!shop.location || !shop.location.coordinates || shop.location.coordinates.length < 2) {
        return { ...shop, distance: 999999, images: appendApiKeyToImages(shop.images || []) }; // Place shops without location at the end
      }

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shop.location.coordinates[1],
        shop.location.coordinates[0]
      );
      return { ...shop, distance, images: appendApiKeyToImages(shop.images || []) };
    })
    .filter((shop) => !maxDistance || shop.distance <= maxDistance);

  // Filter by openNow if requested
  let filteredShops = shopsWithDistance;
  if (openNow) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    filteredShops = shopsWithDistance.filter((shop) => {
      const todayHours = shop.operatingHours?.find(
        (hours: any) => hours.dayOfWeek === dayOfWeek
      );
      if (!todayHours || todayHours.isClosed) return false;
      return (
        currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
      );
    });
  }

  // Sort
  switch (sortBy) {
    case SortOption.DISTANCE:
      filteredShops.sort((a, b) => a.distance - b.distance);
      break;
    case SortOption.ALPHABETICAL_ASC:
      filteredShops.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case SortOption.ALPHABETICAL_DESC:
      filteredShops.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case SortOption.RELEVANCE:
      // Already sorted by text search score if query exists
      break;
  }

  // Paginate
  const total = filteredShops.length;
  const skip = (pagination.page - 1) * pagination.limit;
  const paginatedShops = filteredShops.slice(skip, skip + pagination.limit);

  return {
    results: paginatedShops,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  };
};

/**
 * Get Shop Details
 */
export const getShopById = async (shopId: string) => {
  const shop = await Shop.findOne({
    _id: shopId,
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  }).lean();
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }
  // Append API key to images
  return {
    ...shop,
    images: appendApiKeyToImages(shop.images || [])
  };
};

/**
 * Get Shop Catalogue
 */
export const getShopCatalogue = async (shopId: string) => {
  const catalogue = await Catalogue.findOne({ shop: shopId })
    .populate('shop')
    .populate('items')
    .lean();
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Append API key to item images and capitalize category
  const itemsWithApiKeys = (catalogue.items as any[]).map((item: any) => ({
    ...item,
    category: capitalizeCategory(item.category),
    images: appendApiKeyToImages(item.images || [])
  }));

  return {
    ...catalogue,
    items: itemsWithApiKeys
  };
};
