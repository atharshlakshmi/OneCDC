import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware';
import * as moderationService from '../services/moderationService';

/**
 * Get Reported Reviews
 * GET /api/admin/reports/reviews
 */
export const getReportedReviews = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const reports = await moderationService.getPendingReports('review');

    res.status(200).json({
      success: true,
      data: reports,
    });
  }
);

/**
 * Get Reported Shops
 * GET /api/admin/reports/shops
 */
export const getReportedShops = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const reports = await moderationService.getPendingReports('shop');

    res.status(200).json({
      success: true,
      data: reports,
    });
  }
);

/**
 * Get All Pending Reports
 * GET /api/admin/reports
 */
export const getAllReports = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const reports = await moderationService.getPendingReports();

    res.status(200).json({
      success: true,
      data: reports,
    });
  }
);

/**
 * Moderate Review
 * POST /api/admin/moderate/review/:reportId
 */
export const moderateReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const adminId = req.user!.id;
    const { reportId } = req.params;
    const { action, reason } = req.body;

    const result = await moderationService.moderateReview(
      adminId,
      reportId,
      action,
      reason
    );

    res.status(200).json(result);
  }
);

/**
 * Moderate Shop
 * POST /api/admin/moderate/shop/:reportId
 */
export const moderateShop = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const adminId = req.user!.id;
    const { reportId } = req.params;
    const { action, reason } = req.body;

    const result = await moderationService.moderateShop(
      adminId,
      reportId,
      action,
      reason
    );

    res.status(200).json(result);
  }
);

/**
 * Remove User
 * DELETE /api/admin/users/:userId
 */
export const removeUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const adminId = req.user!.id;
    const { userId } = req.params;
    const { reason } = req.body;

    const result = await moderationService.removeUser(adminId, userId, reason);

    res.status(200).json(result);
  }
);

/**
 * Get Users with Warnings
 * GET /api/admin/users
 */
export const getUsersWithWarnings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { minWarnings } = req.query;

    const users = await moderationService.getUsersWithWarnings(
      minWarnings ? parseInt(minWarnings as string) : 1
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  }
);

/**
 * Get Moderation Logs
 * GET /api/admin/logs
 */
export const getModerationLogs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit } = req.query;

    const logs = await moderationService.getModerationLogs(
      limit ? parseInt(limit as string) : 100
    );

    res.status(200).json({
      success: true,
      data: logs,
    });
  }
);
