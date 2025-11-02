import express from 'express';
import * as searchService from '../services/searchService';
import * as reviewService from '../services/reviewService';
import logger from '../utils/logger';
import { IShop, ICatalogue, IItem } from '../types';
import { Types } from 'mongoose';

const router = express.Router();

logger.info('[API-V2] Router file loaded');

/**
 * GET /api/
 * API Root endpoint
 */
router.get('/', (_req, res) => {
  res.json({ ok: true, message: 'OneCDC API v2' });
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (_req, res) => {
  logger.info('[API-V2] Health endpoint hit');
  res.status(200).json({
    success: true,
    message: 'API-V2 Router Works!',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/shops
 * Get all active shops with their catalogues
 */
router.get('/shops', async (_req, res) => {
  logger.info('[API-V2] Shops endpoint hit');
  try {
    // Use searchService instead of inline queries
    const { results } = await searchService.searchShops(
      {},
      undefined,
      { page: 1, limit: 100 }
    );

    // Format for backward compatibility with frontend
    const formattedShops = await Promise.all(
      results.map(async (shop: any) => {
        const catalogue = await searchService.getShopCatalogue(
          shop._id.toString()
        );

        return {
          id: shop._id.toString(),
          name: shop.name,
          details: shop.description,
          address: shop.address,
          contact_number: shop.phone,
          operating_hours: formatOperatingHours(shop.operatingHours),
          items: catalogue.items.map((item: any) => ({
            id: item._id.toString(),
            name: item.name,
            price: `$${item.price || 0}`,
          })),
        };
      })
    );

    res.status(200).json(formattedShops);
  } catch (error: any) {
    logger.error('[API-V2] Error fetching shops:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

/**
 * GET /api/shops/:id
 * Get shop by ID with catalogue
 */
router.get('/shops/:id', async (req, res) => {
  logger.info(`[API-V2] Shop by ID endpoint hit: ${req.params.id}`);
  try {
    const { id } = req.params;

    // Use searchService
    const shop = await searchService.getShopById(id);
    const catalogue = await searchService.getShopCatalogue(id);

    const formattedShop = {
      id: (shop._id as Types.ObjectId).toString(),
      name: shop.name,
      details: shop.description,
      address: shop.address,
      contact_number: shop.phone,
      operating_hours: formatOperatingHours(shop.operatingHours),
      items: catalogue.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        price: `$${item.price || 0}`,
      })),
    };

    res.status(200).json(formattedShop);
  } catch (error: any) {
    logger.error('[API-V2] Error fetching shop:', error);

    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Shop not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

/**
 * GET /api/items/:id
 * Get item by ID
 */
router.get('/items/:id', async (req, res) => {
  logger.info(`[API-V2] Item by ID endpoint hit: ${req.params.id}`);
  try {
    const { Catalogue } = await import('../models');
    const { id } = req.params;

    const catalogue = await Catalogue.findOne({ 'items._id': id }).lean();

    if (!catalogue) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const item = (catalogue as any).items.find(
      (i: any) => i._id.toString() === id
    );

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const formattedItem = {
      id: item._id.toString(),
      name: item.name,
      price: `$${item.price || 0}`,
    };

    res.status(200).json(formattedItem);
  } catch (error: any) {
    logger.error('[API-V2] Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * GET /api/items/:id/reviews
 * Get reviews for an item
 */
router.get('/items/:id/reviews', async (req, res) => {
  logger.info(`[API-V2] Item reviews endpoint hit: ${req.params.id}`);
  try {
    const { Catalogue } = await import('../models');
    const { id } = req.params;

    // Find catalogue containing this item
    const catalogue = await Catalogue.findOne({ 'items._id': id });

    if (!catalogue) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Use reviewService to get reviews
    const reviewData = await reviewService.getItemReviews(
      catalogue._id.toString(),
      id
    );

    const formattedReviews = reviewData.reviews.map((review: any) => ({
      id: review._id.toString(),
      itemId: id,
      rating: review.rating,
      comment: review.comment,
    }));

    res.status(200).json(formattedReviews);
  } catch (error: any) {
    logger.error('[API-V2] Error fetching reviews:', error);

    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * Helper function to format operating hours
 */
function formatOperatingHours(hours: any[]): string {
  if (!hours || hours.length === 0) {
    return '9 AM - 9 PM'; // Default fallback
  }

  // Get today's hours
  const today = new Date().getDay();
  const todayHours = hours.find((h) => h.dayOfWeek === today);

  if (!todayHours || todayHours.isClosed) {
    return 'Closed';
  }

  return `${todayHours.openTime} - ${todayHours.closeTime}`;
}

logger.info('[API-V2] Router exported');

export default router;
