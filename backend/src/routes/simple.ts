import express from 'express';
import * as controller from '../controllers/simpleController';

const router = express.Router();

/**
 * Simple routes matching frontend structure
 * These routes match the frontend's expectations without authentication
 */

// Get all shops
router.get('/shops', controller.getAllShops);

// Get single shop by ID
router.get('/shops/:id', controller.getShopById);

// Get all items
router.get('/items', controller.getAllItems);

// Get single item by ID with reviews
router.get('/items/:id', controller.getItemById);

// Get reviews for an item
router.get('/items/:id/reviews', controller.getItemReviews);

export default router;
