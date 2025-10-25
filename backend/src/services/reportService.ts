import { Report } from '../models';
import { ReportCategory } from '../types';
import { AppError } from '../middleware';
import logger from '../utils/logger';

/**
 * Report Review (Use Case #4-1)
 */
export const reportReview = async (
  reporterId: string,
  reviewId: string,
  category: ReportCategory,
  description: string
) => {
  // Check if already reported by this user
  const existingReport = await Report.findOne({
    reporter: reporterId,
    targetType: 'review',
    targetId: reviewId,
  });

  if (existingReport) {
    throw new AppError('You have already reported this review', 409);
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType: 'review',
    targetId: reviewId,
    category,
    description,
  });

  logger.info(`Review ${reviewId} reported by user ${reporterId}`);

  // TODO: Notify all admins of new report
  // This would typically send an email or push notification to admins

  return report;
};

/**
 * Report Shop (Use Case #4-2)
 */
export const reportShop = async (
  reporterId: string,
  shopId: string,
  category: ReportCategory,
  description: string
) => {
  // Check if already reported by this user
  const existingReport = await Report.findOne({
    reporter: reporterId,
    targetType: 'shop',
    targetId: shopId,
  });

  if (existingReport) {
    throw new AppError('You have already reported this shop', 409);
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType: 'shop',
    targetId: shopId,
    category,
    description,
  });

  logger.info(`Shop ${shopId} reported by user ${reporterId}`);

  // TODO: Notify all admins of new report

  return report;
};

/**
 * Get User's Reports
 */
export const getUserReports = async (userId: string) => {
  const reports = await Report.find({ reporter: userId })
    .sort({ timestamp: -1 })
    .limit(50);

  return reports;
};
