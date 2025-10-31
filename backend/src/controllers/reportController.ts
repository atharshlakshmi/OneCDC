import { Response } from 'express';
import { AuthRequest, ReportCategory } from '../types';
import { asyncHandler } from '../middleware';
import * as reportService from '../services/reportService';

/**
 * Report Review
 * POST /api/reports/review
 */
export const reportReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reporterId = req.user!.id;
    const { reviewId, category, description } = req.body;

    const report = await reportService.reportReview(
      reporterId,
      reviewId,
      category as ReportCategory,
      description
    );

    res.status(201).json({
      success: true,
      data: report,
      message: 'Review reported successfully',
    });
  }
);

/**
 * Report Shop
 * POST /api/reports/shop
 */
export const reportShop = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reporterId = req.user!.id;
    const { shopId, category, description } = req.body;

    const report = await reportService.reportShop(
      reporterId,
      shopId,
      category as ReportCategory,
      description
    );

    res.status(201).json({
      success: true,
      data: report,
      message: 'Shop reported successfully',
    });
  }
);

/**
 * Get User's Reports
 * GET /api/reports/my-reports
 */
export const getMyReports = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const reports = await reportService.getUserReports(userId);

    res.status(200).json({
      success: true,
      data: reports,
    });
  }
);
