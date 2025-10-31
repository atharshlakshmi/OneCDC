// backend/src/services/searchService.ts

import { Shop, Catalogue } from '../models';
import { SearchFilters, SortOption, PaginationOptions } from '../types';
import { calculateDistance, getDefaultLocation } from '../utils/distance';
import { AppError } from '../middleware';

/**
 * Search for Items 
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

  // Match shops by filters
  const shopMatch: any = { isActive: true };
  if (category) shopMatch.category = category;
  if (ownerVerified !== undefined) shopMatch.verifiedByOwner = ownerVerified;

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

  // Filter items
  const itemMatch: any = {};
  if (query) {
    itemMatch.$or = [
      { 'catalogue.items.name': { $regex: query, $options: 'i' } },
      { 'catalogue.items.description': { $regex: query, $options: 'i' } },
    ];
  }
  if (availability !== undefined) {
    itemMatch['catalogue.items.availability'] = availability;
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
      sortStage = { 'catalogue.items.name': 1 };
      break;
    case SortOption.ALPHABETICAL_DESC:
      sortStage = { 'catalogue.items.name': -1 };
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
      item: '$catalogue.items',
    },
  });

  const results = await Shop.aggregate(pipeline);

  // Get total count
  const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, project
  countPipeline.push({ $count: 'total' });
  const countResult = await Shop.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  return {
    results,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  };
};

/**
 * Search for Shops
 */
export const searchShops = async (
  filters: SearchFilters,
  sortBy: SortOption = SortOption.DISTANCE,
  pagination: PaginationOptions = { page: 1, limit: 20 }
) => {
  const { query, category, ownerVerified, openNow, location, maxDistance } =
    filters;
  const userLocation = location || getDefaultLocation();

  // Build query
  const queryObj: any = { isActive: true };

  if (query) {
  // Match if any word starts with the query (case-insensitive)
  queryObj.name = {
    $regex: new RegExp(`\\b${query}`, "i"),
  };
}
  if (category) {
    if (Array.isArray(category)) {
      queryObj.category = { $in: category };
    } else {
      queryObj.category = category;
    }
  }

  if (typeof ownerVerified === "boolean") {
    queryObj.verifiedByOwner = ownerVerified;
  }

  console.log("Shop query object:", queryObj);
  console.log("User location:", userLocation);
  console.log("Filters:", filters);
  console.log("Sort by:", sortBy);

  // Find shops
  let shopsQuery = Shop.find(queryObj);

  // Get all shops to calculate distance
  const allShops = await shopsQuery.lean();

  console.log(allShops);

  // Calculate distances and filter
  const shopsWithDistance = allShops
    .map((shop) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shop.location.coordinates[1],
        shop.location.coordinates[0]
      );
      return { ...shop, distance };
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
  const shop = await Shop.findOne({ _id: shopId, isActive: true });
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }
  return shop;
};

/**
 * Get Shop Catalogue
 */
export const getShopCatalogue = async (shopId: string) => {
  const catalogue = await Catalogue.findOne({ shop: shopId }).populate('shop');
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }
  return catalogue;
};
