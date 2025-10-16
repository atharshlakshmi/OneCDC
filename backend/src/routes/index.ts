import express from 'express';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'OneCDC API is running - MINIMAL ROUTER',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Test route for /shops
 */
router.get('/shops', async (_req, res) => {
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
          operating_hours: '9 AM - 9 PM',
          items: catalogue ? catalogue.items.map((item: any) => ({
            id: item._id.toString(),
            name: item.name,
            price: `$${item.price || 0}`,
          })) : [],
        };
      })
    );

    res.status(200).json(formattedShops);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

export default router;
