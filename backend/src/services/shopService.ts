import { Shop, Catalogue, Owner, ModerationLog } from "../models";
import { AppError } from "../middleware";
import logger from "../utils/logger";
import * as mapsService from "./mapsService";

/**
 * Get Owner's Shops
 */
export const getOwnerShops = async (ownerId: string) => {
  const shops = await Shop.find({ owner: ownerId, isActive: true }).sort({
    createdAt: -1,
  });

  return shops;
};

/**
 * Get Single Owner's Shop
 */
export const getOwnerShop = async (shopId: string, ownerId: string) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });

  if (!shop) {
    throw new AppError("Shop not found or unauthorized", 404);
  }

  return shop;
};

/**
 * Get Owner's Flagged Shops (with warnings > 0)
 */
export const getFlaggedShops = async (ownerId: string) => {
  // Find all shops with warnings > 0
  const shops = await Shop.find({
    owner: ownerId,
    warnings: { $gt: 0 },
  }).sort({ warnings: -1, createdAt: -1 });

  // For each shop, get the moderation logs (warning reasons)
  const shopsWithWarnings = await Promise.all(
    shops.map(async (shop) => {
      const moderationLogs = await ModerationLog.find({
        targetType: "shop",
        targetId: shop._id,
        action: "warn_shop",
      })
        .populate("admin", "name email")
        .sort({ timestamp: -1 })
        .lean();

      return {
        ...shop.toObject(),
        moderationLogs,
      };
    })
  );

  return shopsWithWarnings;
};

/**
 * Create Shop
 */
export const createShop = async (ownerId: string, shopData: any) => {
  // Verify owner
  const owner = await Owner.findById(ownerId);
  if (!owner) {
    throw new AppError("Owner not found", 404);
  }

  // If location coordinates are not provided, geocode the address
  if (!shopData.location || !shopData.location.coordinates) {
    if (!shopData.address) {
      throw new AppError("Address is required when coordinates are not provided", 400);
    }

    try {
      const coordinates = await mapsService.geocodeAddress(shopData.address);
      shopData.location = {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat], // MongoDB uses [lng, lat] order
      };
    } catch (error: any) {
      throw new AppError(error.message || "Failed to geocode address. Please verify the address is correct.", 400);
    }
  }

  // Create shop
  const shop = await Shop.create({
    ...shopData,
    owner: ownerId,
    lastUpdatedBy: ownerId,
  });

  // Create empty catalogue
  await Catalogue.create({
    shop: shop._id,
    items: [],
  });

  // Add shop to owner's shops
  owner.shops.push(shop._id as any);
  await owner.save();

  logger.info(`Shop created: ${shop.name} by owner ${ownerId}`);

  return shop;
};

/**
 * Update Shop Page (Use Case #3-1)
 */
export const updateShop = async (shopId: string, ownerId: string, updates: any) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });

  if (!shop) {
    throw new AppError("Shop not found or unauthorized", 404);
  }

  // If address is being updated without coordinates, geocode it
  if (updates.address && updates.address !== shop.address && (!updates.location || !updates.location.coordinates)) {
    try {
      const coordinates = await mapsService.geocodeAddress(updates.address);
      updates.location = {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat],
      };
    } catch (error: any) {
      throw new AppError(error.message || "Failed to geocode address. Please verify the address is correct.", 400);
    }
  }

  // Update allowed fields
  const allowedUpdates = ["name", "description", "address", "location", "phone", "email", "category", "images", "operatingHours", "verifiedByOwner"];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      (shop as any)[field] = updates[field];
    }
  });

  shop.lastUpdatedBy = ownerId as any;
  await shop.save();

  logger.info(`Shop updated: ${shop.name} by owner ${ownerId}`);

  return shop;
};

/**
 * Delete Shop (soft delete)
 */
export const deleteShop = async (shopId: string, ownerId: string) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId });

  if (!shop) {
    throw new AppError("Shop not found or unauthorized", 404);
  }

  shop.isActive = false;
  await shop.save();

  logger.info(`Shop deleted: ${shop.name} by owner ${ownerId}`);

  return { success: true, message: "Shop deleted successfully" };
};

/**
 * Get Shop Catalogue
 */
export const getShopCatalogue = async (shopId: string, ownerId?: string) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new AppError("Shop not found", 404);
  }

  // If owner is checking, verify ownership
  if (ownerId && shop.owner.toString() !== ownerId) {
    throw new AppError("Unauthorized", 403);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId });
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  return catalogue;
};

/**
 * Add Catalogue Item (Use Case #3-2)
 */
export const addCatalogueItem = async (shopId: string, ownerId: string, itemData: any) => {
  // Verify shop ownership
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });
  if (!shop) {
    throw new AppError("Shop not found or unauthorized", 404);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId });
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  const newItem = {
    name: itemData.name,
    description: itemData.description,
    price: itemData.price,
    availability: itemData.availability !== undefined ? itemData.availability : true,
    images: itemData.images || [],
    category: itemData.category,
    cdcVoucherAccepted: itemData.cdcVoucherAccepted !== undefined ? itemData.cdcVoucherAccepted : true,
    lastUpdatedBy: ownerId,
    lastUpdatedDate: new Date(),
    reviews: [],
  };

  catalogue.items.push(newItem as any);
  await catalogue.save();

  logger.info(`Item added to catalogue: ${itemData.name} in shop ${shopId}`);

  return catalogue;
};

/**
 * Update Catalogue Item (Use Case #3-3)
 */
export const updateCatalogueItem = async (shopId: string, itemId: string, ownerId: string, updates: any) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });
  if (!shop) {
    throw new AppError("Shop not found or unauthorized", 404);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId });
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  const item = catalogue.items.id(itemId);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Update allowed fields
  const allowedUpdates = ["name", "description", "price", "availability", "images", "category", "cdcVoucherAccepted"];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      (item as any)[field] = updates[field];
    }
  });

  item.lastUpdatedBy = ownerId as any;
  item.lastUpdatedDate = new Date();

  await catalogue.save();

  logger.info(`Item updated: ${item.name} in shop ${shopId}`);

  return catalogue;
};

/**
 * Delete Catalogue Item
 */
export const deleteCatalogueItem = async (shopId: string, itemId: string, ownerId: string) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });
  if (!shop) {
    throw new AppError("Shop not found or unauthorized", 404);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId });
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  const item = catalogue.items.id(itemId);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Remove item
  (catalogue.items as any).pull(itemId);
  await catalogue.save();

  logger.info(`Item deleted: ${itemId} from shop ${shopId}`);

  return { success: true, message: "Item deleted successfully" };
};
