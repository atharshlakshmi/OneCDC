import { Report, ModerationLog, User, Shop, Catalogue, Item, Review } from '../models';
import { ModerationAction, ReportStatus, UserRole, IModerationLog, IUser } from '../types';
import { AppError } from '../middleware';
import logger from '../utils/logger';
import config from '../config';
import { Types } from 'mongoose';

const SHOPPER_WARNING_THRESHOLD = config.moderation.shopper.warningThreshold;
const OWNER_REPORT_THRESHOLD = config.moderation.owner.reportThreshold;

/**
 * Moderate Review (Use Case #5-1)
 */
export const moderateReview = async (
  adminId: string,
  reportId: string,
  action: 'approve' | 'remove',
  reason?: string
) => {
  // Get report
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError('Report not found', 404);
  }

  if (report.targetType !== 'review') {
    throw new AppError('Report is not for a review', 400);
  }

  // First, try to find the review in the standalone Review collection
  let targetReview: any = await Review.findById(report.targetId);
  let isStandaloneReview = !!targetReview;
  let targetItem: any = null;
  let itemName: string = '';

  // If not found in standalone collection, check nested reviews in Item documents
  if (!targetReview) {
    // Query all items that have reviews with matching ID
    const items = await Item.find({
      'reviews._id': report.targetId
    });

    for (const item of items) {
      const review = item.reviews.find(
        (r: any) => r._id.toString() === report.targetId.toString()
      );
      if (review) {
        targetReview = review;
        targetItem = item;
        itemName = item.name;
        break;
      }
    }
  } else {
    itemName = targetReview.item;
  }

  if (!targetReview) {
    throw new AppError('Review not found', 404);
  }

  if (action === 'remove') {
    // Mark review as inactive and add warning
    if (isStandaloneReview) {
      // Handle standalone review
      targetReview.isActive = false;
      targetReview.warnings += 1;
      await targetReview.save();
    } else {
      // Handle nested review in Item document
      targetReview.isActive = false;
      targetReview.warnings += 1;
      await targetItem.save();
    }

    // Add warning to shopper
    const shopper = await User.findById(targetReview.shopper);
    if (shopper) {
      shopper.warnings.push({
        reason: `Review for item "${itemName}" was removed.`,
        issuedBy: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId as any,
        issuedAt: new Date(),
        relatedReport: Types.ObjectId.isValid(reportId) ? new Types.ObjectId(reportId) : reportId as any,
      });
      await shopper.save();

      // Check if threshold reached
      if (shopper.warnings.length >= SHOPPER_WARNING_THRESHOLD) {
        logger.warn(
          `Shopper ${shopper.email} has reached warning threshold (${shopper.warnings.length})`
        );
      }
    }

    // Prepare moderation log data
    const targetIdValue = targetReview._id;
    const moderationLogData = {
      admin: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId,
      action: ModerationAction.REMOVE_REVIEW,
      targetType: 'review' as const,
      targetId: Types.ObjectId.isValid(targetIdValue) ? new Types.ObjectId(targetIdValue) : targetIdValue,
      relatedReport: Types.ObjectId.isValid(reportId) ? new Types.ObjectId(reportId) : reportId,
      details: `Review removed from item "${itemName}"`.substring(0, 1000), // Ensure max length
    };

    logger.info(`Creating ModerationLog for REMOVE_REVIEW with data: ${JSON.stringify({
      admin: moderationLogData.admin,
      action: moderationLogData.action,
      targetType: moderationLogData.targetType,
      targetId: moderationLogData.targetId,
    })}`);

    try {
      const removeLog = await ModerationLog.create(moderationLogData);
      logger.info(`ModerationLog created for REMOVE_REVIEW: ${removeLog._id}`);
    } catch (error: any) {
      logger.error('Failed to create ModerationLog for REMOVE_REVIEW:', error);
      logger.error('Validation errors:', error.errors);
      throw new AppError(`Failed to create moderation log: ${error.message}`, 500);
    }

    // Update report status to REVIEW_REMOVED
    report.status = ReportStatus.REVIEW_REMOVED;
  } else {
    // Prepare moderation log data
    const targetIdValue = targetReview._id;
    const moderationLogData = {
      admin: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId,
      action: ModerationAction.APPROVE_REVIEW,
      targetType: 'review' as const,
      targetId: Types.ObjectId.isValid(targetIdValue) ? new Types.ObjectId(targetIdValue) : targetIdValue,
      relatedReport: Types.ObjectId.isValid(reportId) ? new Types.ObjectId(reportId) : reportId,
      details: 'Review approved after investigation',
    };

    logger.info(`Creating ModerationLog for APPROVE_REVIEW with data: ${JSON.stringify({
      admin: moderationLogData.admin,
      action: moderationLogData.action,
      targetType: moderationLogData.targetType,
      targetId: moderationLogData.targetId,
    })}`);

    try {
      const approveLog = await ModerationLog.create(moderationLogData);
      logger.info(`ModerationLog created for APPROVE_REVIEW: ${approveLog._id}`);
    } catch (error: any) {
      logger.error('Failed to create ModerationLog for APPROVE_REVIEW:', error);
      logger.error('Validation errors:', error.errors);
      throw new AppError(`Failed to create moderation log: ${error.message}`, 500);
    }

    // Update report status to RESOLVED
    report.status = ReportStatus.RESOLVED;
  }

  // Update common report fields
  report.reviewedBy = Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId as any;
  report.reviewedAt = new Date();
  report.resolution = reason || 'No reason provided';
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
  action: 'approve' | 'remove',
  reason?: string
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

  if (action === 'remove') {
    // Deactivate shop and increment warning count
    shop.isActive = false;
    shop.warnings += 1;
    await shop.save();

    // Add warning to owner
    const owner = await User.findById(shop.owner);
    if (owner) {
      owner.warnings.push({
        reason: `Shop "${shop.name}" was removed.`,
        issuedBy: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId as any,
        issuedAt: new Date(),
        relatedReport: Types.ObjectId.isValid(reportId) ? new Types.ObjectId(reportId) : reportId as any,
      });
      await owner.save();
    }

    // Log moderation action
    try {
      const removeLog = await ModerationLog.create({
        admin: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId,
        action: ModerationAction.REMOVE_SHOP,
        targetType: 'shop' as const,
        targetId: shop._id,
        relatedReport: Types.ObjectId.isValid(reportId) ? new Types.ObjectId(reportId) : reportId,
        details: `Shop "${shop.name}" removed after review.`.substring(0, 1000),
      });
      logger.info(`ModerationLog created for REMOVE_SHOP: ${removeLog._id}`);
    } catch (error: any) {
      logger.error('Failed to create ModerationLog for REMOVE_SHOP:', error);
      throw new AppError(`Failed to create moderation log: ${error.message}`, 500);
    }
  } else {
    // Approve - shop is legitimate
    try {
      const approveLog = await ModerationLog.create({
        admin: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId,
        action: ModerationAction.APPROVE_SHOP,
        targetType: 'shop' as const,
        targetId: shop._id,
        relatedReport: Types.ObjectId.isValid(reportId) ? new Types.ObjectId(reportId) : reportId,
        details: 'Shop approved after investigation',
      });
      logger.info(`ModerationLog created for APPROVE_SHOP: ${approveLog._id}`);
    } catch (error: any) {
      logger.error('Failed to create ModerationLog for APPROVE_SHOP:', error);
      throw new AppError(`Failed to create moderation log: ${error.message}`, 500);
    }
  }

  // Update report status
  report.status = ReportStatus.RESOLVED;
  report.reviewedBy = Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId as any;
  report.reviewedAt = new Date();
  report.resolution = reason || 'No reason provided';
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
  reason?: string
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
  try {
    const removeUserLog = await ModerationLog.create({
      admin: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : adminId,
      action: ModerationAction.REMOVE_USER,
      targetType: 'user' as const,
      targetId: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId,
      details: `User ${user.email} removed due to violations`.substring(0, 1000),
    });
    logger.info(`ModerationLog created for REMOVE_USER: ${removeUserLog._id}`);
  } catch (error: any) {
    logger.error('Failed to create ModerationLog for REMOVE_USER:', error);
    throw new AppError(`Failed to create moderation log: ${error.message}`, 500);
  }

  logger.info(`User ${userId} removed by admin ${adminId}`);

  return { success: true, message: 'User removed successfully' };
};

/**
 * Get Pending Reports
 */
export const getPendingReports = async (
  targetType?: 'review' | 'shop'
): Promise<any[]> => {
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

  // If fetching review reports, add review details
  if (targetType === 'review') {
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const reportObj = report.toObject();

        // First, try to find the review in the standalone Review collection
        let reviewDetails = null;
        try {
          const review = await Review.findById(report.targetId)
            .populate('shopper', 'name email')
            .populate('shop', 'name')
            .populate('catalogue');

          if (review) {
            reviewDetails = {
              _id: review._id,
              rating: 0, // Standalone reviews don't have ratings in the current schema
              comment: review.description,
              availability: review.availability,
              reviewer: {
                name: (review.shopper as any)?.name || 'Unknown User',
                email: (review.shopper as any)?.email || 'unknown@email.com',
              },
              itemName: review.item,
              shopName: (review.shop as any)?.name || 'Unknown Shop',
              images: review.images || [],
              photos: review.images || [],
            };
          }
        } catch (error) {
          logger.debug(`Review ${report.targetId} not found in standalone collection, checking nested structure`);
        }

        // Fallback: If not found in standalone collection, check nested reviews in Item documents
        if (!reviewDetails) {
          // Query all items that have reviews with matching ID
          const items = await Item.find({
            'reviews._id': report.targetId
          });

          for (const item of items) {
            const review = item.reviews.find(
              (r: any) => r._id.toString() === report.targetId.toString()
            );
            if (review) {
              // Get shopper details
              const shopper = await User.findById(review.shopper).select('name email');

              // Find the catalogue and shop for this item
              const catalogue = await Catalogue.findOne({
                items: item._id
              }).populate('shop', 'name');

              reviewDetails = {
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                availability: review.availability,
                reviewer: {
                  name: shopper?.name || 'Unknown User',
                  email: shopper?.email || 'unknown@email.com',
                },
                itemName: item.name,
                shopName: (catalogue?.shop as any)?.name || 'Unknown Shop',
                images: review.photos || [],
                photos: review.photos || [],
              };
              break;
            }
          }
        }

        return {
          ...reportObj,
          reviewDetails,
        };
      })
    );

    return reportsWithDetails;
  }

  // If fetching shop reports, add shop details
  if (targetType === 'shop') {
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const reportObj = report.toObject();
        const shop = await Shop.findById(report.targetId).populate('owner', 'name email');

        // Helper function to append API key to images
        const appendApiKey = (images: string[]): string[] => {
          const apiKey = config.googleMaps.apiKey;
          if (!apiKey || !images) return images || [];

          return images.map(imageUrl => {
            if (!imageUrl) return imageUrl;
            // Skip Base64 data URLs and blob URLs
            if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
              return imageUrl;
            }
            // Check if URL already has key parameter
            if (imageUrl.includes('key=')) return imageUrl;
            // Append API key to HTTP/HTTPS URLs
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              return `${imageUrl}&key=${apiKey}`;
            }
            return imageUrl;
          });
        };

        return {
          ...reportObj,
          shopDetails: shop ? {
            _id: shop._id,
            name: shop.name,
            address: shop.address,
            description: shop.description,
            category: shop.category,
            phone: shop.phone,
            email: shop.email,
            owner: shop.owner ? {
              name: (shop.owner as any).name,
              email: (shop.owner as any).email,
            } : undefined,
            reportCount: shop.reportCount,
            warnings: shop.warnings,
            images: appendApiKey(shop.images || []),
          } : null,
        };
      })
    );

    return reportsWithDetails;
  }

  return reports;
};

/**
 * Get Moderation Logs
 */
export const getModerationLogs = async (
  limit: number = 100
): Promise<IModerationLog[]> => {
  try {
    const logs = await ModerationLog.find()
      .sort({ createdAt: -1, timestamp: -1 })
      .limit(limit)
      .populate('admin', 'name email')
      .populate('relatedReport', '_id targetType')
      .lean();

    logger.info(`Retrieved ${logs.length} moderation logs from database`);

    // Log sample data for debugging
    if (logs.length > 0) {
      logger.debug(`Sample log: ${JSON.stringify({
        action: logs[0].action,
        admin: logs[0].admin,
        targetType: logs[0].targetType,
        timestamp: logs[0].timestamp
      })}`);
    }

    return logs;
  } catch (error: any) {
    logger.error(`Error fetching moderation logs: ${error.message}`);
    throw error;
  }
};

/**
 * Get Users with Warnings
 */
export const getUsersWithWarnings = async (
  minWarnings: number = 1
): Promise<IUser[]> => {
  const users = await User.find({
    'warnings.0': { $exists: true },
  })
    .select('-passwordHash')
    .populate('warnings.issuedBy', 'name email')
    .populate('warnings.relatedReport', '_id targetType status')
    .lean();

  return users.filter((user) => user.warnings.length >= minWarnings);
};
