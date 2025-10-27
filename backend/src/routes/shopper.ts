import express from 'express';
import { body } from 'express-validator';
import * as shopperController from '../controllers/shopperController';
import { authenticate, authorize, validate, reviewLimiter, reportLimiter } from '../middleware';
import { UserRole } from '../types';

const router = express.Router();

// All shopper routes require registered shopper authentication
router.use(authenticate, authorize(UserRole.REGISTERED_SHOPPER));

// ========== CART ROUTES ==========

/**
 * GET /api/shopper/cart
 * Get shopper's cart
 */
router.get('/cart', shopperController.getCart);

/**
 * POST /api/shopper/cart/add
 * Add shop to cart
 */
router.post(
  '/cart/add',
  validate([
    body('shopId').isMongoId().withMessage('Valid shop ID is required'),
    body('itemTag').notEmpty().withMessage('Item tag is required'),
  ]),
  shopperController.addToCart
);

/**
 * DELETE /api/shopper/cart/remove/:shopId
 * Remove shop from cart
 */
router.delete('/cart/remove/:shopId', shopperController.removeFromCart);

/**
 * DELETE /api/shopper/cart/clear
 * Clear entire cart
 */
router.delete('/cart/clear', shopperController.clearCart);

/**
 * POST /api/shopper/cart/generate-route
 * Generate most efficient route through shops in cart
 */
router.post(
  '/cart/generate-route',
  validate([
    body('origin.lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('origin.lng')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('mode')
      .optional()
      .isIn(['walking', 'driving', 'transit'])
      .withMessage('Valid transport mode is required'),
  ]),
  shopperController.generateRoute
);

// ========== REVIEW ROUTES ==========

/**
 * POST /api/shopper/reviews
 * Submit a review for an item
 */
router.post(
  '/reviews',
  reviewLimiter,
  validate([
    body('catalogueId').isMongoId().withMessage('Valid catalogue ID is required'),
    body('itemId').isMongoId().withMessage('Valid item ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .notEmpty()
      .withMessage('Comment is required')
      .isLength({ max: 1000 })
      .withMessage('Comment must not exceed 1000 characters'),
    body('availability').isBoolean().withMessage('Availability must be a boolean'),
    body('photos')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 photos allowed'),
  ]),
  shopperController.submitReview
);

/**
 * GET /api/shopper/reviews/my-reviews
 * Get all reviews by this shopper
 */
router.get('/reviews/my-reviews', shopperController.getMyReviews);

/**
 * PUT /api/shopper/reviews/:catalogueId/:itemId/:reviewId
 * Update own review
 */
router.put(
  '/reviews/:catalogueId/:itemId/:reviewId',
  validate([
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Comment must not exceed 1000 characters'),
    body('availability')
      .optional()
      .isBoolean()
      .withMessage('Availability must be a boolean'),
    body('photos')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 photos allowed'),
  ]),
  shopperController.updateReview
);

/**
 * DELETE /api/shopper/reviews/:catalogueId/:itemId/:reviewId
 * Delete own review
 */
router.delete('/reviews/:catalogueId/:itemId/:reviewId', shopperController.deleteReview);

// ========== REPORT ROUTES ==========

/**
 * POST /api/shopper/reports/review
 * Report an inappropriate review
 */
router.post(
  '/reports/review',
  reportLimiter,
  validate([
    body('reviewId').isMongoId().withMessage('Valid review ID is required'),
    body('category')
      .isIn(['spam', 'offensive', 'misleading', 'false_information'])
      .withMessage('Valid category is required'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
  ]),
  shopperController.reportReview
);

/**
 * POST /api/shopper/reports/shop
 * Report an inappropriate shop
 */
router.post(
  '/reports/shop',
  reportLimiter,
  validate([
    body('shopId').isMongoId().withMessage('Valid shop ID is required'),
    body('category')
      .isIn(['spam', 'offensive', 'misleading', 'false_information'])
      .withMessage('Valid category is required'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
  ]),
  shopperController.reportShop
);

/**
 * GET /api/shopper/reports/my-reports
 * Get all reports submitted by this shopper
 */
router.get('/reports/my-reports', shopperController.getMyReports);

export default router;
