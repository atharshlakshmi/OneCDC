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
  sortBy: SortOption = SortOption.DISTANCE,
  pagination: PaginationOptions = { page: 1, limit: 20 }
) => {
  const { query, category, availability, ownerVerified, location, maxDistance, openNow } = filters;
  const userLocation = location || getDefaultLocation();

  // Build shop query
  const shopQuery: any = { isActive: true };
  if (category) {
    if (Array.isArray(category)) {
      shopQuery.category = { $in: category };
    } else {
      shopQuery.category = category;
    }
  }

  if (typeof ownerVerified === "boolean") {
    shopQuery.verifiedByOwner = ownerVerified;
  }

  console.log("Item search - Shop query object:", shopQuery);
  console.log("User location:", userLocation);
  console.log("Filters:", filters);
  console.log("Sort by:", sortBy);
  console.log("-----------------------------------");

  // Find all active shops
  const allShops = await Shop.find(shopQuery).lean();

  // Get catalogues for all shops
  const shopIds = allShops.map((shop) => shop._id);
  const catalogues = await Catalogue.find({ shop: { $in: shopIds } }).lean();

  // Create a map of shop to catalogue
  const catalogueMap = new Map();
  catalogues.forEach((catalogue) => {
    catalogueMap.set(catalogue.shop.toString(), catalogue);
  });

  // Build results array with shop-item pairs
  let results: any[] = [];

  allShops.forEach((shop) => {
    const catalogue = catalogueMap.get(shop._id.toString());
    if (!catalogue || !catalogue.items || catalogue.items.length === 0) {
      return;
    }

    // Filter items based on query and availability
    let filteredItems = catalogue.items.filter((item: any) => {
      // Filter by query
      if (query) {
        const nameMatch = item.name.toLowerCase().includes(query.toLowerCase());
        const descMatch = item.description?.toLowerCase().includes(query.toLowerCase());
        if (!nameMatch && !descMatch) return false;
      }

      // Filter by availability
      if (availability !== undefined && item.availability !== availability) {
        return false;
      }

      return true;
    });

    // Add each filtered item as a result with shop info
    filteredItems.forEach((item: any) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shop.location.coordinates[1],
        shop.location.coordinates[0]
      );

      // Clean item name - remove shop name suffix if present
      let cleanItemName = item.name;
      const shopNamePattern = new RegExp(`\\s*-\\s*${shop.name}\\s*$`, 'i');
      cleanItemName = cleanItemName.replace(shopNamePattern, '').trim();

      results.push({
        shopId: shop._id,
        shopName: shop.name,
        shopAddress: shop.address,
        shopCategory: shop.category,
        shopLocation: shop.location,
        shopPhone: shop.phone,
        shopEmail: shop.email,
        verifiedByOwner: shop.verifiedByOwner,
        operatingHours: shop.operatingHours,
        distance,
        item: {
          _id: item._id,
          name: cleanItemName,
          description: item.description,
          price: item.price,
          availability: item.availability,
          images: item.images,
          category: item.category,
          cdcVoucherAccepted: item.cdcVoucherAccepted,
        },
      });
    });
  });

  // Filter by max distance if provided
  if (maxDistance) {
    results = results.filter((result) => result.distance <= maxDistance);
  }

  // Filter by openNow if requested
  if (openNow) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  results = results.filter((result) => {
    const todayHours = result.operatingHours?.find(
      (hours: any) => hours.dayOfWeek === dayOfWeek
    );
    if (!todayHours || todayHours.isClosed) return false;

    const [openH, openM] = todayHours.openTime.split(":").map(Number);
    const [closeH, closeM] = todayHours.closeTime.split(":").map(Number);
    const openTotal = openH * 60 + openM;
    const closeTotal = closeH * 60 + closeM;

    return currentMinutes >= openTotal && currentMinutes <= closeTotal;
  });
}

  // Sort results
  switch (sortBy) {
    case SortOption.DISTANCE:
      results.sort((a, b) => a.distance - b.distance);
      break;
    case SortOption.ALPHABETICAL_ASC:
      results.sort((a, b) => a.item.name.localeCompare(b.item.name));
      break;
    case SortOption.ALPHABETICAL_DESC:
      results.sort((a, b) => b.item.name.localeCompare(a.item.name));
      break;
    case SortOption.RELEVANCE:
      // Already filtered by query
      break;
  }

  // Paginate
  const total = results.length;
  const skip = (pagination.page - 1) * pagination.limit;
  const paginatedResults = results.slice(skip, skip + pagination.limit);

  // Round distances for display
  paginatedResults.forEach((result) => {
    result.distance = Math.round(result.distance * 100) / 100;
  });

  console.log(paginatedResults);
  return {
    results: paginatedResults,
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
  console.log("-----------------------------------");

  // Find shops
  let shopsQuery = Shop.find(queryObj);

  // Get all shops to calculate distance
  const allShops = await shopsQuery.lean();


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
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  filteredShops = shopsWithDistance.filter((shop) => {
    const todayHours = shop.operatingHours?.find(
      (hours: any) => hours.dayOfWeek === dayOfWeek
    );
    if (!todayHours || todayHours.isClosed) return false;

    const [openH, openM] = todayHours.openTime.split(":").map(Number);
    const [closeH, closeM] = todayHours.closeTime.split(":").map(Number);
    const openTotal = openH * 60 + openM;
    const closeTotal = closeH * 60 + closeM;

    return currentMinutes >= openTotal && currentMinutes <= closeTotal;
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

  console.log(pagination);
  console.log(paginatedShops);
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