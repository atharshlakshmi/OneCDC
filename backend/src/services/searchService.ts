// backend/src/services/searchService.ts

import { Shop, Catalogue } from '../models';
import { SearchFilters, SortOption, PaginationOptions } from '../types';
import { calculateDistance, getDefaultLocation } from '../utils/distance';
import { AppError } from '../middleware';

// In-memory cache for category classifications
interface CacheEntry {
  category: string;
  timestamp: number;
}

const categoryCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 1000;

/**
 * Clean expired cache entries
 */
const cleanCache = () => {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  categoryCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_DURATION) {
      entriesToDelete.push(key);
    }
  });
  
  entriesToDelete.forEach(key => categoryCache.delete(key));
  
  if (categoryCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(categoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, categoryCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => categoryCache.delete(key));
  }
};

/**
 * Categorize item using Hugging Face model
 */
const categorizeItemWithHF = async (itemQuery: string): Promise<string> => {
  try {
    // Normalize query for cache lookup
    const normalizedQuery = itemQuery.toLowerCase().trim();
    
    // Check cache first
    const cached = categoryCache.get(normalizedQuery);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_DURATION) {
        console.log(`✅ Cache hit for "${itemQuery}": ${cached.category} (age: ${Math.round(age / 1000)}s)`);
        return cached.category;
      } else {
        categoryCache.delete(normalizedQuery);
      }
    }
    
    const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    
    if (!HF_TOKEN) {
      console.warn('No Hugging Face token found, defaulting to "other" category');
      return 'other';
    }

    const categories = [
      'food and beverage',
      'grocery and supermarket',
      'healthcare and pharmacy',
      'retail and shopping',
      'services',
      'electronics and technology',
      'fashion and clothing',
      'general items'
    ];

    console.log(`🔍 Cache miss for "${itemQuery}", calling HF API...`);
    
    // Use faster DistilBERT model (2-3x faster than BART)
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/typeform/distilbert-base-uncased-mnli',
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: itemQuery,
          parameters: { 
            candidate_labels: categories 
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HF API error: ${response.status} - ${errorText}`);
      return 'other';
    }

    const result = await response.json();
    console.log('HF API Response:', JSON.stringify(result));
    
    // Get the top category from the labels array
    const res: any = result;
    let topCategory = 'general items';

    if (res) {
      if (Array.isArray(res.labels) && res.labels.length > 0 && typeof res.labels[0] === 'string') {
      topCategory = res.labels[0];
      } else if (typeof res.label === 'string') {
      topCategory = res.label;
      }
    }

    topCategory = String(topCategory).toLowerCase().trim();
    
    // Map to our category enum
    const categoryMap: { [key: string]: string } = {
      'food and beverage': 'food_beverage',
      'grocery and supermarket': 'grocery',
      'healthcare and pharmacy': 'healthcare',
      'retail and shopping': 'retail',
      'services': 'services',
      'electronics and technology': 'electronics',
      'fashion and clothing': 'fashion',
      'general items': 'other',
    };

    const mappedCategory = categoryMap[topCategory] || 'other';
    
    // Store in cache
    categoryCache.set(normalizedQuery, {
      category: mappedCategory,
      timestamp: Date.now()
    });
    
    // Clean old entries periodically
    if (categoryCache.size > MAX_CACHE_SIZE * 0.9) {
      cleanCache();
    }
    
    console.log(`🤖 HF categorized "${itemQuery}" as: ${mappedCategory} (from "${topCategory}" with score ${result.scores?.[0] || 'N/A'})`);
    console.log(`📦 Cache size: ${categoryCache.size} entries`);
    
    return mappedCategory;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    return 'other'; // Fallback to 'other' if API fails
  }
};

/**
 * Format category name for display
 */
const formatCategoryName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    food_beverage: 'Food & Beverage',
    grocery: 'Grocery',
    healthcare: 'Healthcare',
    retail: 'Retail',
    services: 'Services',
    electronics: 'Electronics',
    fashion: 'Fashion',
    other: 'General',
  };
  
  return categoryMap[category] || 'General';
};

/**
 * Search shops by category
 */
const searchShopsByCategory = async (
  category: string,
  userLocation: { lat: number; lng: number },
  pagination: PaginationOptions
) => {
  console.log(`🔍 searchShopsByCategory called with category: ${category}`);
  
  // Find shops in the category
  const shops = await Shop.find({
    isActive: true,
    category: category,
  }).lean();

  console.log(`📊 Found ${shops.length} shops with category: ${category}`);

  // Calculate distances
  const shopsWithDistance = shops.map((shop) => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      shop.location.coordinates[1],
      shop.location.coordinates[0]
    );
    return { ...shop, distance: Math.round(distance * 100) / 100 };
  });

  // Sort by distance
  shopsWithDistance.sort((a, b) => a.distance - b.distance);

  // Paginate
  const total = shopsWithDistance.length;
  const skip = (pagination.page - 1) * pagination.limit;
  const paginatedShops = shopsWithDistance.slice(skip, skip + pagination.limit);

  console.log(`📦 Returning ${paginatedShops.length} shops after pagination (total: ${total})`);

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
 * Categorize and suggest shops
 */
const categorizeAndSuggestShops = async (
  itemQuery: string,
  userLocation: { lat: number; lng: number },
  pagination: PaginationOptions = { page: 1, limit: 20 }
) => {
  try {
    console.log(`🔎 Starting categorizeAndSuggestShops for "${itemQuery}"`);
    
    // Get category from Hugging Face model (with cache)
    const suggestedCategory = await categorizeItemWithHF(itemQuery);
    console.log(`📋 Got category: ${suggestedCategory}`);

    // Search for shops in that category
    console.log(`🏪 Searching for shops in category: ${suggestedCategory}`);
    const categoryShops = await searchShopsByCategory(
      suggestedCategory,
      userLocation,
      pagination
    );
    
    console.log(`✨ Found ${categoryShops.results.length} shops in ${suggestedCategory} category`);

    return {
      suggestedCategory,
      categoryName: formatCategoryName(suggestedCategory),
      suggestedShops: categoryShops.results,
      pagination: categoryShops.pagination,
      fallbackMessage: `We couldn't find "${itemQuery}" but found shops in the ${formatCategoryName(suggestedCategory)} category that might have what you're looking for.`,
    };
  } catch (error) {
    console.error('Error in categorizeAndSuggestShops:', error);
    
    // Fallback to generic search if everything fails
    const allShops = await searchShopsByCategory(
      'other',
      userLocation,
      pagination
    );
    
    return {
      categoryName: 'General',
      suggestedShops: allShops.results,  // renamed from "shops"
      pagination: allShops.pagination,
      fallbackMessage: `We couldn't find "${itemQuery}". Here are some shops that might be helpful.`,
    };
  }
};

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

  console.log(`Found ${results.length} items before filtering`);


  // If no results and there's a query, try LLM-based category suggestion BEFORE filtering
  // This avoids calling LLM when user has active filters that eliminate results
  if (results.length === 0 && query && query.trim().length > 0) {
    console.log('No items found, trying LLM-based category suggestion...');
    const suggestion = await categorizeAndSuggestShops(
      query,
      userLocation,
      pagination
    );
    
    console.log(`✨ LLM suggested ${suggestion.suggestedShops.length} shops`);
    
    const fallbackResponse = {
      results: [],
      suggestedShops: suggestion.suggestedShops,
      suggestedCategory: suggestion.suggestedCategory,
      categoryName: suggestion.categoryName,
      fallbackMessage: suggestion.fallbackMessage,
      pagination: suggestion.pagination,
      isFallback: true,
    };
    
    console.log('🚀 Returning fallback response:', JSON.stringify({
      resultsLength: fallbackResponse.results.length,
      suggestedShops: fallbackResponse.suggestedShops,
      isFallback: fallbackResponse.isFallback,
      message: fallbackResponse.fallbackMessage
    }));
    
    return fallbackResponse;
  }

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

  console.log(`Found ${paginatedResults.length} items after filtering and pagination`);  
  return {
    results: paginatedResults,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
    isFallback: false,
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

  console.log(`Found ${paginatedShops.length} shops`);
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