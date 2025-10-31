import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * INLINE VERSION - All logic directly in routes file
 * No controller imports to eliminate potential circular dependencies
 */

// Helper functions
function formatPrice(price?: number): string {
  if (price === undefined || price === null) {
    return '$0';
  }
  return `$${price}`;
}

function formatOperatingHours(hours: any[]): string {
  if (!hours || hours.length === 0) {
    return '9 AM - 9 PM';
  }
  const firstDay = hours[0];
  if (firstDay) {
    return `${firstDay.openTime} - ${firstDay.closeTime}`;
  }
  return '9 AM - 9 PM';
}

// Get all shops
router.get('/shops', async (_req: Request, res: Response) => {
  try {
    const { Shop, Catalogue } = await import('../models');
    const shops = await Shop.find({ isActive: true }).lean();

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
          items: catalogue
            ? catalogue.items.map((item: any) => ({
                id: item._id.toString(),
                name: item.name,
                price: formatPrice(item.price),
              }))
            : [],
        };
      })
    );

    res.status(200).json(formattedShops);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Get single shop by ID
router.get('/shops/:id', async (req: Request, res: Response) => {
  try {
    const { Shop, Catalogue } = await import('../models');
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
      items: catalogue
        ? (catalogue as any).items.map((item: any) => ({
            id: item._id.toString(),
            name: item.name,
            price: formatPrice(item.price),
          }))
        : [],
    };

    res.status(200).json(formattedShop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

// Get all items
router.get('/items', async (_req: Request, res: Response) => {
  try {
    const { Catalogue } = await import('../models');
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get single item by ID
router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const { Catalogue } = await import('../models');
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Get reviews for an item
router.get('/items/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { Catalogue } = await import('../models');
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
