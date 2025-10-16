import express from 'express';
import { body } from 'express-validator';
import * as reportController from '../controllers/reportController';
import { authenticate, validate, reportLimiter } from '../middleware';

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

/**
 * POST /api/reports/review
 * Report a review
 */
router.post(
  '/review',
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
  reportController.reportReview
);

/**
 * POST /api/reports/shop
 * Report a shop
 */
router.post(
  '/shop',
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
  reportController.reportShop
);

/**
 * GET /api/reports/my-reports
 * Get user's reports
 */
router.get('/my-reports', reportController.getMyReports);

export default router;
