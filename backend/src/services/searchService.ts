// backend/src/services/searchService.ts

import { Shop, Catalogue, Item } from "../models";
import { SearchFilters, SortOption, PaginationOptions, ShopCategory } from "../types";
import { calculateDistance, getDefaultLocation } from "../utils/distance";
import { AppError } from "../middleware";

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

  entriesToDelete.forEach((key) => categoryCache.delete(key));

  if (categoryCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(categoryCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, categoryCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => categoryCache.delete(key));
  }
};

/**
 * Format category name for display
 */
const formatCategoryName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    food_beverage: "Food & Beverage",
    grocery: "Grocery",
    healthcare: "Healthcare",
    retail: "Retail",
    services: "Services",
    electronics: "Electronics",
    fashion: "Fashion",
    other: "General",
  };

  return categoryMap[category] || "General";
};

/**
 * Categorize item using Hugging Face model
 */
const categorizeItemWithHF = async (itemQuery: string): Promise<ShopCategory> => {
  try {
    // Normalize query for cache lookup
    const normalizedQuery = itemQuery.toLowerCase().trim();

    // Check cache first
    const cached = categoryCache.get(normalizedQuery);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_DURATION) {
        console.log(`✅ Cache hit for "${itemQuery}": ${cached.category} (age: ${Math.round(age / 1000)}s)`);
        return cached.category as ShopCategory;
      } else {
        categoryCache.delete(normalizedQuery);
      }
    }

    const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      console.warn("No Hugging Face token found, defaulting to ShopCategory.OTHER");
      return ShopCategory.OTHER;
    }

    // canonical categories (enum values)
    const categories: ShopCategory[] = [
      ShopCategory.FOOD_BEVERAGE,
      ShopCategory.GROCERY,
      ShopCategory.HEALTHCARE,
      ShopCategory.RETAIL,
      ShopCategory.SERVICES,
      ShopCategory.ELECTRONICS,
      ShopCategory.FASHION,
      ShopCategory.OTHER,
    ];

    console.log(`🔍 Cache miss for "${itemQuery}", calling HF API...`);

    const response = await fetch("https://router.huggingface.co/hf-inference/models/typeform/distilbert-base-uncased-mnli", {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: itemQuery,
        parameters: {
          candidate_labels: categories,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HF API error: ${response.status} - ${errorText}`);
      return ShopCategory.OTHER;
    }

    const resultAny: any = await response.json();
    console.log("HF API Response:", JSON.stringify(resultAny));

    // Extract top label correctly
    let rawLabel = "";
    let topScore: number | null = null;
    if (Array.isArray(resultAny) && resultAny.length > 0 && typeof resultAny[0].label === "string") {
      rawLabel = resultAny[0].label;
      topScore = resultAny[0].score;
    }

    const normalizedLabel = String(rawLabel || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");

    let topCategory: ShopCategory = categories.find((c) => c === (normalizedLabel as ShopCategory)) || ShopCategory.OTHER;

    // cache the result (store enum string)
    categoryCache.set(normalizedQuery, {
      category: topCategory,
      timestamp: Date.now(),
    });

    if (categoryCache.size > MAX_CACHE_SIZE * 0.9) cleanCache();

    console.log(`🤖 HF categorized "${itemQuery}" as: ${topCategory} (raw: "${rawLabel}", score: ${topScore ?? "N/A"})`);
    return topCategory;
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return ShopCategory.OTHER;
  }
};

/**
 * Categorize and suggest shops
 */
const categorizeAndSuggestShops = async (itemQuery: string, userLocation: { lat: number; lng: number }, pagination: PaginationOptions = { page: 1, limit: 20 }) => {
  try {
    console.log(`🔎 Starting categorizeAndSuggestShops for "${itemQuery}"`);

    // Get category from Hugging Face model (with cache)
    const suggestedCategory: ShopCategory = await categorizeItemWithHF(itemQuery);
    console.log(`📋 Got category: ${suggestedCategory}`);

    // Build filters to search shops in the suggested category near the user
    const categoryFilters: SearchFilters = {
      query: undefined,
      category: suggestedCategory,
      ownerVerified: undefined,
      openNow: undefined,
      location: userLocation,
      maxDistance: undefined,
    };

    // Search for shops in that category, sorted by distance
    console.log(`🏪 Searching for shops in category: ${suggestedCategory}`);
    const categoryShops = await searchShops(categoryFilters, SortOption.DISTANCE, pagination);

    console.log(`✨ Found ${categoryShops.results.length} shops in ${suggestedCategory} category`);

    return {
      suggestedCategory,
      categoryName: suggestedCategory,
      suggestedShops: categoryShops.results,
      pagination: categoryShops.pagination,
      fallbackMessage: `We couldn't find "${itemQuery}" but found shops in the ${formatCategoryName(suggestedCategory)} category that might have what you're looking for.`,
    };
  } catch (error) {
    console.error("Error in categorizeAndSuggestShops:", error);

    const GeneralShopFilter: SearchFilters = {
      query: undefined,
      category: ShopCategory.OTHER,
      ownerVerified: undefined,
      openNow: undefined,
      location: userLocation,
      maxDistance: undefined,
    };

    const GeneralShops = await searchShops(GeneralShopFilter, SortOption.DISTANCE, pagination);

    return {
      categoryName: "General",
      suggestedShops: GeneralShops.results,
      pagination: GeneralShops.pagination,
      fallbackMessage: `We couldn't find "${itemQuery}". Here are some shops that might be helpful.`,
    };
  }
};

/**
 * Search for Items
 */
export const searchItems = async (filters: SearchFilters, sortBy: SortOption = SortOption.DISTANCE, pagination: PaginationOptions = { page: 1, limit: 20 }) => {
  const { query, category, availability, ownerVerified, location, maxDistance, openNow } = filters;
  const userLocation = location || getDefaultLocation();

  console.log("❗❗❗❗ Starting item search", { filters, sortBy, userLocation });

  // Build item query
  const itemQuery: any = {};

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    itemQuery.$or = [{ name: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
  }

  if (availability !== undefined) {
    itemQuery.availability = availability;
  }

  // Find items from items collection
  const items = await Item.find(itemQuery).lean();
  console.log(`🧾 Found ${items.length} items from items collection`);

  if (!items.length && query?.trim()) {
    console.log("⚙️ No items found, using LLM category suggestion...");
    const suggestion = await categorizeAndSuggestShops(query, userLocation, pagination);
    console.log(`🧾 Return: Fallback found ${suggestion.suggestedShops.length} shops in category ${suggestion.suggestedCategory}`);

    return {
      results: [],
      suggestedShops: suggestion.suggestedShops,
      suggestedCategory: suggestion.suggestedCategory,
      categoryName: suggestion.categoryName,
      fallbackMessage: suggestion.fallbackMessage,
      pagination: suggestion.pagination,
      isFallback: true,
    };
  }

  // Get unique catalogue IDs from items
  const catalogueIds = [...new Set(items.map((item) => item.catalogue.toString()))];

  // Find catalogues to get shop IDs
  const catalogues = await Catalogue.find({ _id: { $in: catalogueIds } }).lean();
  const catalogueToShopMap = new Map(catalogues.map((cat) => [cat._id.toString(), cat.shop.toString()]));

  // Get unique shop IDs
  const shopIds = [...new Set(catalogues.map((cat) => cat.shop.toString()))];

  // Find shops by IDs with filters
  const shopQuery: any = {
    _id: { $in: shopIds },
    isActive: true,
  };

  if (category) {
    shopQuery.category = Array.isArray(category) ? { $in: category } : category;
  }

  if (typeof ownerVerified === "boolean") {
    shopQuery.verifiedByOwner = ownerVerified;
  }

  const shops = await Shop.find(shopQuery).lean();
  console.log(`🏪 Found ${shops.length} shops matching filters`);

  // Create a map of shop ID -> shop
  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  // Build results by joining items with catalogues and shops
  let results = items
    .map((item) => {
      const shopId = catalogueToShopMap.get(item.catalogue.toString());
      if (!shopId) return null;

      const shop = shopMap.get(shopId);
      if (!shop) return null;

      const distance = calculateDistance(userLocation.lat, userLocation.lng, shop.location.coordinates[1], shop.location.coordinates[0]);

      const cleanName = item.name.replace(new RegExp(`\\s*-\\s*${shop.name}\\s*$`, "i"), "").trim();

      return {
        shopId: shop._id,
        shopName: shop.name,
        shopCategory: shop.category,
        shopAddress: shop.address,
        shopLocation: shop.location,
        verifiedByOwner: shop.verifiedByOwner,
        operatingHours: shop.operatingHours,
        distance,
        item: { ...item, name: cleanName },
        catalogueId: item.catalogue,
      };
    })
    .filter((result): result is NonNullable<typeof result> => result !== null);

  console.log(`🧾 Built ${results.length} item-shop pairs`);

  // Additional filters
  if (maxDistance) {
    results = results.filter((r) => r.distance <= maxDistance);
  }

  if (openNow) {
    const now = new Date();
    const day = now.getDay();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    results = results.filter(({ operatingHours }) => {
      const today = operatingHours?.find((h: any) => h.dayOfWeek === day);
      if (!today || today.isClosed) return false;
      const [oH, oM] = today.openTime.split(":").map(Number);
      const [cH, cM] = today.closeTime.split(":").map(Number);
      const openMins = oH * 60 + oM;
      const closeMins = cH * 60 + cM;
      return currentMins >= openMins && currentMins <= closeMins;
    });
  }

  // Sorting
  const sorters: Record<SortOption, (a: any, b: any) => number> = {
    [SortOption.DISTANCE]: (a, b) => a.distance - b.distance,
    [SortOption.ALPHABETICAL_ASC]: (a, b) => a.item.name.localeCompare(b.item.name),
    [SortOption.ALPHABETICAL_DESC]: (a, b) => b.item.name.localeCompare(a.item.name),
    [SortOption.RELEVANCE]: () => 0,
    [SortOption.RATING]: (a, b) => (b.shopRating || 0) - (a.shopRating || 0),
  };

  results.sort(sorters[sortBy]);

  // Pagination
  const total = results.length;
  const start = (pagination.page - 1) * pagination.limit;
  const paginatedResults = results.slice(start, start + pagination.limit).map((r) => ({
    ...r,
    distance: Math.round(r.distance * 100) / 100,
  }));

  console.log(`✅ Returning ${paginatedResults.length}/${total} items`);

  return {
    results: paginatedResults,
    pagination: {
      ...pagination,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
    isFallback: false,
  };
};

/**
 * Search for Shops
 */
export const searchShops = async (filters: SearchFilters, sortBy: SortOption = SortOption.DISTANCE, pagination: PaginationOptions = { page: 1, limit: 20 }) => {
  const { query, category, ownerVerified, openNow, location, maxDistance } = filters;
  const userLocation = location || getDefaultLocation();

  // Build query - include shops without isActive field (for backward compatibility)
  const queryObj: any = {
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  };

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

  console.log("🔎 Searching shops with query:", queryObj);

  // Find shops
  let shopsQuery = Shop.find(queryObj);

  // Get all shops to calculate distance
  const allShops = await shopsQuery.lean();

  // Calculate distances and filter
  const shopsWithDistance = allShops
    .map((shop) => {
      // Handle shops without location data
      if (!shop.location || !shop.location.coordinates || shop.location.coordinates.length < 2) {
        return { ...shop, distance: 999999 }; // Place shops without location at the end
      }

      const distance = calculateDistance(userLocation.lat, userLocation.lng, shop.location.coordinates[1], shop.location.coordinates[0]);
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
      const todayHours = shop.operatingHours?.find((hours: any) => hours.dayOfWeek === dayOfWeek);
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

  console.log(`📋 Found ${paginatedShops.length} shops`);

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
    throw new AppError("Shop not found", 404);
  }
  return shop;
};

/**
 * Get Shop Catalogue
 */
export const getShopCatalogue = async (shopId: string) => {
  const catalogue = await Catalogue.findOne({ shop: shopId }).populate("shop").populate("items");
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  return catalogue;
};
