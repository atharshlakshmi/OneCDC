import { Report, Review, Shop } from "../models";
import { ReportCategory } from "../types";
import { AppError } from "../middleware";
import logger from "../utils/logger";

/**
 * Report Review (Use Case #4-1)
 */
export const reportReview = async (reporterId: string, reviewId: string, category: ReportCategory, description: string) => {
  // First, fetch the review to check ownership
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  // Check if the reporter is trying to report their own review
  if (review.shopper.toString() === reporterId) {
    throw new AppError("You cannot report your own review", 403);
  }

  // Check if already reported by this user
  const existingReport = await Report.findOne({
    reporter: reporterId,
    targetType: "review",
    targetId: reviewId,
  });

  if (existingReport) {
    throw new AppError("You have already reported this review", 409);
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType: "review",
    targetId: reviewId,
    category,
    description,
  });

  logger.info(`Review ${reviewId} reported by user ${reporterId}`);

  // Increment the report count on the review
  const updatedReview = await Review.findByIdAndUpdate(reviewId, { $inc: { reportCount: 1 } }, { new: true });

  if (updatedReview) {
    logger.info(`Review ${reviewId} report count incremented to ${updatedReview.reportCount}`);
  } else {
    logger.warn(`Could not find review ${reviewId} to increment report count.`);
  }

  return report;
};

/**
 * Report Shop (Use Case #4-2)
 */
export const reportShop = async (reporterId: string, shopId: string, category: ReportCategory, description: string) => {
  // Check if already reported by this user
  const existingReport = await Report.findOne({
    reporter: reporterId,
    targetType: "shop",
    targetId: shopId,
  });

  if (existingReport) {
    throw new AppError("You have already reported this shop", 409);
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType: "shop",
    targetId: shopId,
    category,
    description,
  });

  logger.info(`Shop ${shopId} reported by user ${reporterId}`);

  // Increment the report count on the shop
  const updatedShop = await Shop.findByIdAndUpdate(shopId, { $inc: { reportCount: 1 } }, { new: true });

  if (updatedShop) {
    logger.info(`Shop ${shopId} report count incremented to ${updatedShop.reportCount}`);
  } else {
    logger.warn(`Could not find shop ${shopId} to increment report count.`);
  }

  // TODO: Notify all admins of new report

  return report;
};

/**
 * Get User's Reports
 */
export const getUserReports = async (userId: string) => {
  const reports = await Report.find({ reporter: userId }).sort({ timestamp: -1 }).limit(50);

  return reports;
};
