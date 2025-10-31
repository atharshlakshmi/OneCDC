import { Shop, Catalogue, Owner } from '../models';
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

  const catalogue = await Catalogue.findOne({ shop: shopId });
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

  const catalogue = await Catalogue.findOne({ shop: shopId });
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
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

  const item = catalogue.items.id(itemId);
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

  item.lastUpdatedBy = ownerId as any;
  item.lastUpdatedDate = new Date();

  await catalogue.save();

  logger.info(`Item updated: ${item.name} in shop ${shopId}`);

  return catalogue;
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

  const item = catalogue.items.id(itemId);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Remove item
  (catalogue.items as any).pull(itemId);
  await catalogue.save();

  logger.info(`Item deleted: ${itemId} from shop ${shopId}`);

  return { success: true, message: 'Item deleted successfully' };
};
