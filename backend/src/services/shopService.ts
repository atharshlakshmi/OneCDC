import mongoose from 'mongoose';
import { Shop, Catalogue, Item, Owner, ModerationLog } from "../models";
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

  // Validate required fields
  if (!shopData.name) {
    throw new AppError("Shop name is required", 400);
  }
  if (!shopData.description) {
    throw new AppError("Shop description is required", 400);
  }
  if (!shopData.phone) {
    throw new AppError("Shop phone number is required", 400);
  }
  if (!shopData.category) {
    throw new AppError("Shop category is required", 400);
  }

  // Validate phone format
  const phoneRegex = /^[689]\d{7}$/;
  if (!phoneRegex.test(shopData.phone)) {
    throw new AppError("Phone number must be 8 digits starting with 6, 8, or 9", 400);
  }

  // Validate category
  const validCategories = ["food_beverage", "grocery", "healthcare", "retail", "services", "electronics", "fashion", "other"];
  if (!validCategories.includes(shopData.category)) {
    throw new AppError(`Category must be one of: ${validCategories.join(", ")}`, 400);
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

  // Log the data being sent for debugging
  logger.info(
    `Creating shop with data: ${JSON.stringify({
      name: shopData.name,
      category: shopData.category,
      phone: shopData.phone,
      hasLocation: !!shopData.location,
      hasCoordinates: !!shopData.location?.coordinates,
    })}`
  );

  // Create shop WITHOUT catalogue first
  try {
    // Remove catalogue field if it exists in shopData
    const { catalogue: _, ...shopDataWithoutCatalogue } = shopData as any;

    const shop = await Shop.create({
      ...shopDataWithoutCatalogue,
      owner: ownerId,
      lastUpdatedBy: ownerId,
      // Don't include catalogue yet - it doesn't exist
    });

    logger.info(`Shop created (without catalogue): ${shop.name} by owner ${ownerId}`);
    logger.info(`Shop ID: ${shop._id}`);

    // Now create the catalogue that references this shop
    try {
      const catalogue = await Catalogue.create({
        shop: shop._id,
        items: [],
      });

      logger.info(`Catalogue created for shop: ${shop.name}, catalogue ID: ${catalogue._id}`);
      logger.info(`Shop ID: ${shop._id}, Catalogue ID: ${catalogue._id} - Should be DIFFERENT!`);

      // Now link catalogue back to shop
      shop.catalogue = catalogue._id as any;
      await shop.save();

      logger.info(`Catalogue linked to shop: ${shop.name}`);
    } catch (catalogueError: any) {
      // If catalogue creation fails, delete the shop to maintain consistency
      logger.error(`Catalogue creation failed: ${catalogueError.message}`);
      await Shop.findByIdAndDelete(shop._id);
      throw new AppError(`Failed to create catalogue: ${catalogueError.message}`, 500);
    }

    // Add shop to owner's shops
    owner.shops.push(shop._id as any);
    await owner.save();

    logger.info(`Shop ${shop.name} added to owner's shops list`);

    // Return shop with populated catalogue for verification
    const shopWithCatalogue = await Shop.findById(shop._id).populate("catalogue");
    logger.info(`Final shop: ID=${shopWithCatalogue?._id}, Catalogue=${shopWithCatalogue?.catalogue}`);

    return shopWithCatalogue || shop;
  } catch (error: any) {
    logger.error(`Shop creation failed: ${error.message}`);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
    }
    throw error;
  }
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

  shop.lastUpdatedBy = new mongoose.Types.ObjectId(ownerId);
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

  const catalogue = await Catalogue.findOne({ shop: shopId }).populate("items");
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

  const catalogue = await Catalogue.findOne({ shop: shopId }).populate('items');
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  // Check for duplicate item name in the catalogue
  const existingItem = await Item.findOne({
    _id: { $in: catalogue.items },
    name: { $regex: new RegExp(`^${itemData.name}$`, 'i') }, // Case-insensitive exact match
  });

  if (existingItem) {
    throw new AppError('An item with this name already exists in the catalogue', 400);
  }

  // Validate price
  const priceValue = typeof itemData.price === 'number' ? itemData.price : parseFloat(itemData.price);
  if (isNaN(priceValue) || priceValue < 0) {
    throw new AppError('Valid price is required (must be a number >= 0)', 400);
  }

  // Create standalone Item document
  const newItem = await Item.create({
    catalogue: catalogue._id,
    name: itemData.name,
    description: itemData.description,
    price: priceValue,
    availability: itemData.availability !== undefined ? itemData.availability : true,
    images: itemData.images || [],
    category: itemData.category,
    cdcVoucherAccepted: itemData.cdcVoucherAccepted !== undefined ? itemData.cdcVoucherAccepted : true,
    lastUpdatedBy: mongoose.Types.ObjectId.isValid(ownerId)
      ? new mongoose.Types.ObjectId(ownerId)
      : ownerId,
    lastUpdatedDate: new Date(),
    reviews: [],
  });

  // Add item ID to catalogue
  catalogue.items.push(newItem._id as any);
  await catalogue.save();

  logger.info(`Item added to catalogue: ${itemData.name} in shop ${shopId}`);

  // Return catalogue with populated items
  await catalogue.populate("items");
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

  // Find the Item document by ID
  const item = await Item.findOne({ _id: itemId, catalogue: catalogue._id });
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

  item.lastUpdatedBy = new mongoose.Types.ObjectId(ownerId);
  item.lastUpdatedDate = new Date();

  await item.save();

  logger.info(`Item updated: ${item.name} in shop ${shopId}`);

  // Return catalogue with populated items
  await catalogue.populate("items");
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

  // Find the Item document by ID
  const item = await Item.findOne({ _id: itemId, catalogue: catalogue._id });
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Remove item ObjectId from catalogue's items array
  catalogue.items = catalogue.items.filter((id) => id.toString() !== itemId.toString()) as any;
  await catalogue.save();

  // Delete the Item document
  await Item.findByIdAndDelete(itemId);

  logger.info(`Item deleted: ${itemId} from shop ${shopId}`);

  return { success: true, message: "Item deleted successfully" };
};
