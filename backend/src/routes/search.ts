// define endpoints for search-related operations, define what kind of requests can be made

import express from 'express';
import * as searchController from '../controllers/searchController';
import { optionalAuth } from '../middleware';

const router = express.Router();

/**
 * GET /api/search/items
 * Search for items
 */
router.get('/items', optionalAuth, searchController.searchItems);

/**
 * GET /api/search/shops
 * Search for shops
 */
router.get('/shops', optionalAuth, searchController.searchShops);

/**
 * GET /api/search/shops/:id
 * Get shop details
 */
router.get('/shops/:id', optionalAuth, searchController.getShopById);

/**
 * GET /api/search/shops/:id/catalogue
 * Get shop catalogue
 */
router.get('/shops/:id/catalogue', optionalAuth, searchController.getShopCatalogue);

export default router;
