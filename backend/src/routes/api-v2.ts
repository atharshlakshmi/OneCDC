import express from "express";
import * as searchService from "../services/searchService";
import logger from "../utils/logger";
import { Types } from "mongoose";

const router = express.Router();

logger.info("[API-V2] Router file loaded");

/**
 * Helper function to append Google Maps API key to image URLs
 * Only applies to HTTP/HTTPS URLs (Google Maps), not Base64 data URLs
 */
function appendApiKeyToImages(images: string[]): string[] {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !images) return images || [];

  return images.map((imageUrl) => {
    if (!imageUrl) return imageUrl;
    // Skip Base64 data URLs and blob URLs - only process HTTP/HTTPS URLs
    if (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
      return imageUrl;
    }
    // Check if the URL already has the key parameter
    if (imageUrl.includes("key=")) return imageUrl;
    // Only append API key to HTTP/HTTPS URLs (Google Maps)
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return `${imageUrl}&key=${apiKey}`;
    }
    // Return unchanged if not a recognized format
    return imageUrl;
  });
}

/**
 * Helper function to capitalize category
 */
function capitalizeCategory(category: string | undefined): string | undefined {
  if (!category) return category;

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .split("&")
    .map((word) => word.trim().charAt(0).toUpperCase() + word.trim().slice(1))
    .join(" & ");
}

/**
 * GET /api/
 * API Root endpoint
 */
router.get("/", (_req, res) => {
  res.json({ ok: true, message: "OneCDC API v2" });
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get("/health", (_req, res) => {
  logger.info("[API-V2] Health endpoint hit");
  res.status(200).json({
    success: true,
    message: "API-V2 Router Works!",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/shops
 * Get all active shops with their catalogues
 */
router.get("/shops", async (_req, res) => {
  logger.info("[API-V2] Shops endpoint hit");
  try {
    // Use searchService instead of inline queries
    const { results } = await searchService.searchShops({}, undefined, { page: 1, limit: 100 });

    // Format for backward compatibility with frontend
    const formattedShops = await Promise.all(
      results.map(async (shop: any) => {
        let items: Array<{ id: string; name: string; price: string }> = [];

        // Try to get catalogue, but don't fail if it doesn't exist
        try {
          const catalogue = await searchService.getShopCatalogue(shop._id.toString());
          items = catalogue.items.map((item: any) => ({
            id: item._id.toString(),
            name: item.name,
            price: `$${item.price || 0}`,
          }));
        } catch (error) {
          // Shop has no catalogue yet, return empty items array
          logger.debug(`Shop ${shop._id} has no catalogue`);
        }

        return {
          id: shop._id.toString(),
          name: shop.name,
          details: shop.description,
          address: shop.address,
          contact_number: shop.phone,
          operating_hours: formatOperatingHours(shop.operatingHours),
          images: appendApiKeyToImages(shop.images || []),
          items,
        };
      })
    );

    res.status(200).json(formattedShops);
  } catch (error: any) {
    logger.error("[API-V2] Error fetching shops:", error);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

/**
 * GET /api/shops/:id
 * Get shop by ID with catalogue
 */
router.get("/shops/:id", async (req, res) => {
  logger.info(`[API-V2] Shop by ID endpoint hit: ${req.params.id}`);
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        error: "Invalid shop ID format",
        message: "The provided ID is not a valid MongoDB ObjectId. Please use a valid shop ID from the database.",
      });
      return;
    }

    // Use searchService
    const shop = await searchService.getShopById(id);

    // Try to get catalogue, but don't fail if it doesn't exist
    let items: Array<{ id: string; name: string; price: string }> = [];
    try {
      const catalogue = await searchService.getShopCatalogue(id);
      items = catalogue.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        price: `$${item.price || 0}`,
      }));
    } catch (error) {
      // Shop has no catalogue yet, return empty items array
      logger.debug(`Shop ${id} has no catalogue`);
    }

    const formattedShop = {
      id: shop._id.toString(),
      name: shop.name,
      details: shop.description,
      address: shop.address,
      contact_number: shop.phone,
      operating_hours: formatOperatingHours(shop.operatingHours),
      images: appendApiKeyToImages(shop.images || []),
      items,
    };

    res.status(200).json(formattedShop);
  } catch (error: any) {
    logger.error("[API-V2] Error fetching shop:", error);

    if (error.statusCode === 404) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }

    res.status(500).json({ error: "Failed to fetch shop" });
  }
});

/**
 * GET /api/items/:id
 * Get item by name (using name as identifier)
 */
router.get("/items/:id", async (req, res) => {
  logger.info(`[API-V2] Item by id endpoint hit: ${req.params.id}`);
  try {
    const { Item, Catalogue, User } = await import("../models");
    const { id } = req.params;

    // Find item by ObjectId only
    const item = await Item.findById(id).lean();

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    // Find the catalogue containing this item
    const catalogue = await Catalogue.findOne({ items: item._id }).populate("shop").lean();

    if (!catalogue) {
      res.status(404).json({ error: "Item catalogue not found" });
      return;
    }

    const shop = catalogue.shop as any;

    // Get user name for lastUpdatedBy
    let lastUpdatedByName = "Unknown";
    if (item.lastUpdatedBy) {
      try {
        const user = await User.findById(item.lastUpdatedBy).lean();
        if (user) {
          lastUpdatedByName = user.name || user.email || "Unknown";
        }
      } catch (error) {
        logger.debug("Could not fetch user for lastUpdatedBy");
      }
    }

    const formattedItem = {
      id: item.name, // Use name as identifier
      _id: (item._id as Types.ObjectId).toString(), // Add MongoDB ObjectId
      name: item.name,
      description: item.description,
      price: item.price || 0,
      availability: item.availability,
      images: appendApiKeyToImages(item.images || []),
      category: capitalizeCategory(item.category),
      lastUpdatedBy: lastUpdatedByName,
      lastUpdatedDate: item.lastUpdatedDate,
      catalogueId: (catalogue._id as Types.ObjectId).toString(),
      shopId: shop._id.toString(),
      shopName: shop.name,
    };

    res.status(200).json(formattedItem);
  } catch (error: any) {
    logger.error("[API-V2] Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

/**
 * GET /api/items/:id/reviews
 * Get reviews for an item from both standalone Review model and nested reviews in Item
 */
router.get("/items/:id/reviews", async (req, res) => {
  logger.info(`[API-V2] Item reviews endpoint hit: ${req.params.id}`);
  try {
    const { Review, Item, User } = await import("../models");
    const { id } = req.params;

    const allReviews: any[] = [];

    // Find the Item by ObjectId
    const item = await Item.findById(id).lean();

    if (!item) {
      logger.warn(`[API-V2] Item not found: ${id}`);
      return res.status(404).json({ error: "Item not found" });
    }

    const itemObjectId = item._id;

    // Get reviews from standalone Review collection using the Item's ObjectId
    const standaloneReviews = await Review.find({ item: itemObjectId, isActive: true }).populate("shopper", "name").sort({ createdAt: -1 }).lean();

    allReviews.push(
      ...standaloneReviews.map((review: any) => ({
        id: review._id.toString(),
        itemId: id,
        shopperName: review.shopper?.name || "Anonymous",
        shopperId: review.shopper?._id?.toString(),
        description: review.description,
        availability: review.availability,
        images: appendApiKeyToImages(review.images || []),
        createdAt: review.createdAt,
      }))
    );

    // Also check for nested reviews in Item document
    if (item && item.reviews && item.reviews.length > 0) {
      const activeNestedReviews = item.reviews.filter((r: any) => r.isActive);

      for (const review of activeNestedReviews) {
        // Get shopper details
        const shopper = await User.findById(review.shopper).select("name").lean();

        allReviews.push({
          id: review._id.toString(),
          itemId: id,
          shopperName: shopper?.name || "Anonymous",
          shopperId: review.shopper.toString(),
          description: review.comment, // Note: nested reviews use 'comment' field
          availability: review.availability,
          images: appendApiKeyToImages(review.photos || []), // Note: nested reviews use 'photos' field
          createdAt: review.timestamp,
        });
      }
    }

    // Sort all reviews by date (most recent first)
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json(allReviews);
  } catch (error: any) {
    logger.error("[API-V2] Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/**
 * Helper function to format operating hours
 */
function formatOperatingHours(hours: any[]): string {
  if (!hours || hours.length === 0) {
    return "9 AM - 9 PM"; // Default fallback
  }

  // Get today's hours
  const today = new Date().getDay();
  const todayHours = hours.find((h) => h.dayOfWeek === today);

  if (!todayHours || todayHours.isClosed) {
    return "Closed";
  }

  return `${todayHours.openTime} - ${todayHours.closeTime}`;
}

logger.info("[API-V2] Router exported");

export default router;
