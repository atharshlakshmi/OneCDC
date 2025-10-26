import { Report, ModerationLog, User, Shop, Catalogue } from '../models';
import { ModerationAction, ReportStatus, UserRole, IReport, IModerationLog, IUser } from '../types';
import { AppError } from '../middleware';
import logger from '../utils/logger';
import config from '../config';

const SHOPPER_WARNING_THRESHOLD = config.moderation.shopper.warningThreshold;
const OWNER_REPORT_THRESHOLD = config.moderation.owner.reportThreshold;

/**
 * Moderate Review (Use Case #5-1)
 */
export const moderateReview = async (
  adminId: string,
  reportId: string,
  action: 'approve' | 'remove',
  reason: string
) => {
  // Get report
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError('Report not found', 404);
  }

  if (report.targetType !== 'review') {
    throw new AppError('Report is not for a review', 400);
  }

  // Find the review in catalogues
  const catalogues = await Catalogue.find({});
  let targetCatalogue: any = null;
  let targetItem: any = null;
  let targetReview: any = null;

  for (const catalogue of catalogues) {
    for (const item of catalogue.items) {
      const review = item.reviews.find(
        (r: any) => r._id.toString() === report.targetId.toString()
      );
      if (review) {
        targetCatalogue = catalogue;
        targetItem = item;
        targetReview = review;
        break;
      }
    }
    if (targetReview) break;
  }

  if (!targetReview) {
    throw new AppError('Review not found', 404);
  }

  if (action === 'remove') {
    // Mark review as inactive
    targetReview.isActive = false;
    targetReview.warnings += 1;
    await targetCatalogue.save();

    // Add warning to shopper
    const shopper = await User.findById(targetReview.shopper);
    if (shopper) {
      shopper.warnings.push({
        reason,
        issuedBy: adminId as any,
        issuedAt: new Date(),
        relatedReport: reportId as any,
      });
      await shopper.save();

      // Check if threshold reached
      if (shopper.warnings.length >= SHOPPER_WARNING_THRESHOLD) {
        logger.warn(
          `Shopper ${shopper.email} has reached warning threshold (${shopper.warnings.length})`
        );
      }
    }

    // Log moderation action
    await ModerationLog.create({
      admin: adminId,
      action: ModerationAction.REMOVE_REVIEW,
      targetType: 'review',
      targetId: targetReview._id,
      relatedReport: reportId,
      reason,
      details: `Review removed from item "${targetItem.name}"`,
    });
  } else {
    // Approve - just update report status
    await ModerationLog.create({
      admin: adminId,
      action: ModerationAction.APPROVE_REVIEW,
      targetType: 'review',
      targetId: targetReview._id,
      relatedReport: reportId,
      reason,
      details: 'Review approved after investigation',
    });
  }

  // Update report status
  report.status = ReportStatus.RESOLVED;
  report.reviewedBy = adminId as any;
  report.reviewedAt = new Date();
  report.resolution = reason;
  await report.save();

  logger.info(`Review ${targetReview._id} moderated by admin ${adminId}: ${action}`);

  return { success: true, message: `Review ${action}d successfully` };
};

/**
 * Moderate Shop (Use Case #5-2)
 */
export const moderateShop = async (
  adminId: string,
  reportId: string,
  action: 'approve' | 'warn',
  reason: string
) => {
  // Get report
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError('Report not found', 404);
  }

  if (report.targetType !== 'shop') {
    throw new AppError('Report is not for a shop', 400);
  }

  const shop = await Shop.findById(report.targetId).populate('owner');
  if (!shop) {
    throw new AppError('Shop not found', 404);
  }

  if (action === 'warn') {
    // Increment shop warnings and report count
    shop.warnings += 1;
    shop.reportCount += 1;
    await shop.save();

    // Add warning to owner
    const owner = await User.findById(shop.owner);
    if (owner) {
      owner.warnings.push({
        reason,
        issuedBy: adminId as any,
        issuedAt: new Date(),
        relatedReport: reportId as any,
      });
      await owner.save();

      // Check if threshold reached
      if (shop.reportCount >= OWNER_REPORT_THRESHOLD) {
        logger.warn(
          `Shop "${shop.name}" has reached report threshold (${shop.reportCount})`
        );
      }
    }

    // Log moderation action
    await ModerationLog.create({
      admin: adminId,
      action: ModerationAction.WARN_SHOP,
      targetType: 'shop',
      targetId: shop._id,
      relatedReport: reportId,
      reason,
      details: `Warning issued to shop "${shop.name}"`,
    });
  } else {
    // Approve - shop is legitimate
    await ModerationLog.create({
      admin: adminId,
      action: ModerationAction.APPROVE_SHOP,
      targetType: 'shop',
      targetId: shop._id,
      relatedReport: reportId,
      reason,
      details: 'Shop approved after investigation',
    });
  }

  // Update report status
  report.status = ReportStatus.RESOLVED;
  report.reviewedBy = adminId as any;
  report.reviewedAt = new Date();
  report.resolution = reason;
  await report.save();

  logger.info(`Shop ${shop._id} moderated by admin ${adminId}: ${action}`);

  return { success: true, message: `Shop ${action}ed successfully` };
};

/**
 * Remove User (Use Case #5-3)
 */
export const removeUser = async (
  adminId: string,
  userId: string,
  reason: string
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check thresholds
  if (user.role === UserRole.REGISTERED_SHOPPER) {
    if (user.warnings.length < SHOPPER_WARNING_THRESHOLD) {
      throw new AppError(
        `User has not reached warning threshold (${user.warnings.length}/${SHOPPER_WARNING_THRESHOLD})`,
        400
      );
    }
  } else if (user.role === UserRole.OWNER) {
    // Count total reports across owner's shops
    const shops = await Shop.find({ owner: userId });
    const totalReports = shops.reduce((sum, shop) => sum + shop.reportCount, 0);

    if (totalReports < OWNER_REPORT_THRESHOLD) {
      throw new AppError(
        `Owner has not reached report threshold (${totalReports}/${OWNER_REPORT_THRESHOLD})`,
        400
      );
    }
  }

  // Deactivate user
  user.isActive = false;
  await user.save();

  // If owner, deactivate all shops
  if (user.role === UserRole.OWNER) {
    await Shop.updateMany({ owner: userId }, { isActive: false });
  }

  // Log moderation action
  await ModerationLog.create({
    admin: adminId,
    action: ModerationAction.REMOVE_USER,
    targetType: 'user',
    targetId: userId,
    reason,
    details: `User ${user.email} removed due to violations`,
  });

  logger.info(`User ${userId} removed by admin ${adminId}`);

  return { success: true, message: 'User removed successfully' };
};

/**
 * Get Pending Reports
 */
export const getPendingReports = async (
  targetType?: 'review' | 'shop'
): Promise<IReport[]> => {
  const query: { status: ReportStatus; targetType?: 'review' | 'shop' } = {
    status: ReportStatus.PENDING,
  };
  if (targetType) {
    query.targetType = targetType;
  }

  const reports = await Report.find(query)
    .sort({ timestamp: -1 })
    .populate('reporter', 'name email')
    .limit(50);

  return reports;
};

/**
 * Get Moderation Logs
 */
export const getModerationLogs = async (
  limit: number = 100
): Promise<IModerationLog[]> => {
  const logs = await ModerationLog.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('admin', 'name email');

  return logs;
};

/**
 * Get Users with Warnings
 */
export const getUsersWithWarnings = async (
  minWarnings: number = 1
): Promise<IUser[]> => {
  const users = await User.find({
    isActive: true,
    'warnings.0': { $exists: true },
  }).select('-passwordHash');

  return users.filter((user) => user.warnings.length >= minWarnings);
};
