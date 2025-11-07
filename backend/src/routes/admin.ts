import express from 'express';
import { body } from 'express-validator';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize, validate } from '../middleware';
import { UserRole } from '../types';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticate, authorize(UserRole.ADMIN));

/**
 * GET /api/admin/reports
 * Get all pending reports
 */
router.get('/reports', adminController.getAllReports);

/**
 * GET /api/admin/reports/reviews
 * Get reported reviews
 */
router.get('/reports/reviews', adminController.getReportedReviews);

/**
 * GET /api/admin/reports/shops
 * Get reported shops
 */
router.get('/reports/shops', adminController.getReportedShops);

/**
 * POST /api/admin/moderate/review/:reportId
 * Moderate review
 */
router.post(
  '/moderate/review/:reportId',
  validate([
    body('action')
      .isIn(['approve', 'remove'])
      .withMessage('Action must be approve or remove'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must not exceed 500 characters'),
  ]),
  adminController.moderateReview
);

/**
 * POST /api/admin/moderate/shop/:reportId
 * Moderate shop
 */
router.post(
  '/moderate/shop/:reportId',
  validate([
    body('action')
      .isIn(['approve', 'remove'])
      .withMessage('Action must be approve or remove'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must not exceed 500 characters'),
  ]),
  adminController.moderateShop
);

/**
 * DELETE /api/admin/users/:userId
 * Remove user
 */
router.delete(
  '/users/:userId',
  validate([
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must not exceed 500 characters'),
  ]),
  adminController.removeUser
);

/**
 * GET /api/admin/users
 * Get users with warnings
 */
router.get('/users', adminController.getUsersWithWarnings);

/**
 * GET /api/admin/logs
 * Get moderation logs
 */
router.get('/logs', adminController.getModerationLogs);

export default router;
