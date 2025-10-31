import { Request, Response } from 'express';
import { asyncHandler } from '../middleware';
import { Shop, Catalogue } from '../models';

/**
 * Simple controllers matching frontend structure
 * Returns data in the exact format frontend expects
 */

/**
 * Get all shops
 * Frontend expects: { id, name, details, address, contact_number, operating_hours, items: [{id, name, price}] }
 */
export const getAllShops = asyncHandler(async (_req: Request, res: Response) => {
  const shops = await Shop.find({ isActive: true }).lean();

  // Transform to frontend format
  const formattedShops = await Promise.all(
    shops.map(async (shop: any) => {
      const catalogue = await Catalogue.findOne({ shop: shop._id }).lean();

      return {
        id: shop._id.toString(),
        name: shop.name,
        details: shop.description,
        address: shop.address,
        contact_number: shop.phone,
        operating_hours: formatOperatingHours(shop.operatingHours || []),
        items: catalogue ? catalogue.items.map((item: any) => ({
          id: item._id.toString(),
          name: item.name,
          price: formatPrice(item.price),
        })) : [],
      };
    })
  );

  res.status(200).json(formattedShops);
});

/**
 * Get single shop by ID
 */
export const getShopById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const shop = await Shop.findOne({ _id: id, isActive: true }).lean();

  if (!shop) {
    res.status(404).json({ error: 'Shop not found' });
    return;
  }

  const catalogue = await Catalogue.findOne({ shop: shop._id }).lean();

  const formattedShop = {
    id: (shop._id as any).toString(),
    name: shop.name,
    details: shop.description,
    address: shop.address,
    contact_number: shop.phone,
    operating_hours: formatOperatingHours((shop as any).operatingHours || []),
    items: catalogue ? (catalogue as any).items.map((item: any) => ({
      id: item._id.toString(),
      name: item.name,
      price: formatPrice(item.price),
    })) : [],
  };

  res.status(200).json(formattedShop);
});

/**
 * Get all items (flat list)
 */
export const getAllItems = asyncHandler(async (_req: Request, res: Response) => {
  const catalogues = await Catalogue.find().lean();

  const allItems: any[] = [];
  catalogues.forEach((catalogue: any) => {
    catalogue.items.forEach((item: any) => {
      allItems.push({
        id: item._id.toString(),
        name: item.name,
        price: formatPrice(item.price),
      });
    });
  });

  res.status(200).json(allItems);
});

/**
 * Get single item by ID
 */
export const getItemById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const catalogue = await Catalogue.findOne({ 'items._id': id }).lean();

  if (!catalogue) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const item = (catalogue as any).items.find((i: any) => i._id.toString() === id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const formattedItem = {
    id: item._id.toString(),
    name: item.name,
    price: formatPrice(item.price),
  };

  res.status(200).json(formattedItem);
});

/**
 * Get reviews for an item
 * Frontend expects: { id, itemId, rating, comment }
 */
export const getItemReviews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const catalogue = await Catalogue.findOne({ 'items._id': id })
    .populate('items.reviews.shopper', 'name')
    .lean();

  if (!catalogue) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const item = (catalogue as any).items.find((i: any) => i._id.toString() === id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const formattedReviews = item.reviews
    .filter((review: any) => review.isActive)
    .map((review: any) => ({
      id: review._id.toString(),
      itemId: id,
      rating: review.rating,
      comment: review.comment,
    }));

  res.status(200).json(formattedReviews);
});

/**
 * Helper: Format price as string with $ sign
 */
function formatPrice(price?: number): string {
  if (price === undefined || price === null) {
    return '$0';
  }
  return `$${price}`;
}

/**
 * Helper: Format operating hours
 */
function formatOperatingHours(hours: any[]): string {
  if (!hours || hours.length === 0) {
    return '9 AM - 9 PM';
  }

  // Simple format - assuming same hours every day
  const firstDay = hours[0];
  if (firstDay) {
    return `${firstDay.openTime} - ${firstDay.closeTime}`;
  }

  return '9 AM - 9 PM';
}
