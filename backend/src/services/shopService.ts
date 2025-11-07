import mongoose from 'mongoose';
import { Shop, Catalogue, Item, Owner } from '../models';
import { AppError } from '../middleware';
import logger from '../utils/logger';

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
 * Create Shop
 */
export const createShop = async (ownerId: string, shopData: any) => {
  // Verify owner
  const owner = await Owner.findById(ownerId);
  if (!owner) {
    throw new AppError('Owner not found', 404);
  }

  // Create shop
  const shop = await Shop.create({
    ...shopData,
    owner: new mongoose.Types.ObjectId(ownerId),
    lastUpdatedBy: new mongoose.Types.ObjectId(ownerId),
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
export const updateShop = async (
  shopId: string,
  ownerId: string,
  updates: any
) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });

  if (!shop) {
    throw new AppError('Shop not found or unauthorized', 404);
  }

  // Update allowed fields
  const allowedUpdates = [
    'name',
    'description',
    'address',
    'location',
    'phone',
    'email',
    'category',
    'images',
    'operatingHours',
    'verifiedByOwner',
  ];

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
    throw new AppError('Shop not found or unauthorized', 404);
  }

  shop.isActive = false;
  await shop.save();

  logger.info(`Shop deleted: ${shop.name} by owner ${ownerId}`);

  return { success: true, message: 'Shop deleted successfully' };
};

/**
 * Get Shop Catalogue
 */
export const getShopCatalogue = async (shopId: string, ownerId?: string) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  // If owner is checking, verify ownership
  if (ownerId && shop.owner.toString() !== ownerId) {
    throw new AppError('Unauthorized', 403);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId }).populate('items');
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  return catalogue;
};

/**
 * Add Catalogue Item (Use Case #3-2)
 */
export const addCatalogueItem = async (
  shopId: string,
  ownerId: string,
  itemData: any
) => {
  // Verify shop ownership
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });
  if (!shop) {
    throw new AppError('Shop not found or unauthorized', 404);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId }).populate('items');
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
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

  return catalogue.populate('items');
};

/**
 * Add Catalogue Item by Shopper
 * Allows shoppers to add items to any shop's catalogue
 */
export const addCatalogueItemByShopper = async (
  shopId: string,
  shopperId: string,
  itemData: any
) => {
  // Verify shop exists and is active
  const shop = await Shop.findOne({ _id: shopId, isActive: true });
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  // Get or create catalogue for the shop
  let catalogue = await Catalogue.findOne({ shop: shopId }).populate('items');
  if (!catalogue) {
    // Create catalogue if it doesn't exist
    catalogue = await Catalogue.create({
      shop: shopId,
      items: [],
    });
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

  // Prepare item document data
  const itemDocument = {
    catalogue: catalogue._id,
    name: itemData.name,
    description: itemData.description,
    price: priceValue,
    availability: itemData.availability !== undefined ? itemData.availability : true,
    images: itemData.images || [],
    category: itemData.category,
    cdcVoucherAccepted: itemData.cdcVoucherAccepted !== undefined ? itemData.cdcVoucherAccepted : true,
    lastUpdatedBy: mongoose.Types.ObjectId.isValid(shopperId)
      ? new mongoose.Types.ObjectId(shopperId)
      : shopperId,
    lastUpdatedDate: new Date(),
    reviews: [],
  };

  // Log the document being created for debugging
  logger.info('Creating item document:', JSON.stringify(itemDocument, null, 2));

  // Create standalone Item document
  let newItem;
  try {
    newItem = await Item.create(itemDocument);
  } catch (error: any) {
    logger.error('Item creation failed:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key =>
        `${key}: ${error.errors[key].message}`
      );
      throw new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400);
    }
    throw error;
  }

  // Add item ID to catalogue
  logger.info(`Adding item ${newItem._id} to catalogue`);
  catalogue.items.push(newItem._id as any);

  try {
    await catalogue.save();
    logger.info(`Item added to catalogue by shopper: ${itemData.name} in shop ${shopId}`);
  } catch (error: any) {
    logger.error('Catalogue save failed:', error);
    // Clean up the created item if catalogue save fails
    await Item.deleteOne({ _id: newItem._id });
    throw new AppError(`Failed to add item to catalogue: ${error.message}`, 500);
  }

  return catalogue.populate('items');
};

/**
 * Update Catalogue Item (Use Case #3-3)
 */
export const updateCatalogueItem = async (
  shopId: string,
  itemId: string,
  ownerId: string,
  updates: any
) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });
  if (!shop) {
    throw new AppError('Shop not found or unauthorized', 404);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId });
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Find item in Item collection
  const item = await Item.findOne({
    _id: itemId,
    _id: { $in: catalogue.items }
  });
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Update allowed fields
  const allowedUpdates = [
    'name',
    'description',
    'price',
    'availability',
    'images',
    'category',
    'cdcVoucherAccepted',
  ];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      (item as any)[field] = updates[field];
    }
  });

  item.lastUpdatedBy = new mongoose.Types.ObjectId(ownerId);
  item.lastUpdatedDate = new Date();

  await item.save();

  logger.info(`Item updated: ${item.name} in shop ${shopId}`);

  return catalogue.populate('items');
};

/**
 * Delete Catalogue Item
 */
export const deleteCatalogueItem = async (
  shopId: string,
  itemId: string,
  ownerId: string
) => {
  const shop = await Shop.findOne({ _id: shopId, owner: ownerId, isActive: true });
  if (!shop) {
    throw new AppError('Shop not found or unauthorized', 404);
  }

  const catalogue = await Catalogue.findOne({ shop: shopId });
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Verify item exists in catalogue
  if (!catalogue.items.includes(itemId as any)) {
    throw new AppError('Item not found', 404);
  }

  // Remove item ID from catalogue
  catalogue.items = catalogue.items.filter(
    (id: any) => id.toString() !== itemId
  ) as any;
  await catalogue.save();

  // Delete the Item document
  await Item.findByIdAndDelete(itemId);

  logger.info(`Item deleted: ${itemId} from shop ${shopId}`);

  return { success: true, message: 'Item deleted successfully' };
};
