import { Catalogue, Review, Item } from "../models";
import { AppError } from "../middleware";
import logger from "../utils/logger";
import mongoose from "mongoose";

/**
 * Get User's Reviews
 */
export const getMyReviews = async (shopperId: string) => {
  // Query the Review collection directly and populate item and catalogue with shop
  const reviews = await Review.find({
    shopper: new mongoose.Types.ObjectId(shopperId),
    isActive: true,
  })
    .populate("item", "name")
    .populate({
      path: "catalogue",
      select: "shop",
      populate: {
        path: "shop",
        select: "name",
      },
    })
    .sort({ timestamp: -1 })
    .lean();

  // Transform the data to match the expected format
  const transformedReviews = reviews.map((review: any) => ({
    _id: review._id,
    itemId: review.item?._id || review.item,
    catalogueId: review.catalogue?._id || review.catalogue,
    itemName: review.item?.name || "Unknown Item",
    shopName: review.catalogue?.shop?.name || "Unknown Shop",
    rating: review.rating,
    comment: review.comment,
    photos: review.photos || [],
    availability: review.availability,
    createdAt: review.timestamp,
  }));

  return { data: transformedReviews };
};

/**
 * Submit Review (Use Case #2-3)
 */
export const submitReview = async (
  shopperId: string,
  catalogueId: string,
  itemId: string,
  reviewData: {
    rating: number;
    comment: string;
    photos?: string[];
    availability: boolean;
  }
) => {
  // Check if catalogue exists
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  // Check if item exists
  const item = await Item.findById(itemId);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Verify item belongs to catalogue
  if (item.catalogue.toString() !== catalogueId) {
    throw new AppError("Item does not belong to this catalogue", 400);
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    shopper: new mongoose.Types.ObjectId(shopperId),
    catalogue: new mongoose.Types.ObjectId(catalogueId),
    item: new mongoose.Types.ObjectId(itemId),
    isActive: true,
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this item", 409);
  }

  // Create review
  const review = new Review({
    shopper: shopperId,
    catalogue: catalogueId,
    item: itemId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    photos: reviewData.photos || [],
    availability: reviewData.availability,
    timestamp: new Date(),
    warnings: 0,
    isActive: true,
  });

  await review.save();

  // Add review reference to item
  item.reviews.push(review._id as any);
  await item.save();

  logger.info(`Review submitted for item ${itemId} by shopper ${shopperId}`);

  return { success: true, message: "Review submitted successfully", reviewId: review._id };
};

/**
 * Get Reviews for Item
 */
export const getItemReviews = async (_catalogueId: string, itemId: string) => {
  // Note: catalogueId kept for API compatibility but not used in validation
  // after migration to separate collections

  // Check if item exists
  const item = await Item.findById(itemId);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // Get all active reviews for this item
  const reviews = await Review.find({
    item: new mongoose.Types.ObjectId(itemId),
    isActive: true,
  })
    .populate("shopper", "name")
    .sort({ timestamp: -1 })
    .lean();

  // Calculate average rating
  const averageRating = await item.getAverageRating();
  const totalReviews = await item.getReviewCount();

  return {
    item: {
      id: item._id,
      name: item.name,
    },
    reviews: reviews,
    totalReviews: totalReviews,
    averageRating: averageRating,
  };
};

/**
 * Update Own Review
 */
export const updateReview = async (
  shopperId: string,
  catalogueId: string,
  itemId: string,
  reviewId: string,
  updates: {
    rating?: number;
    comment?: string;
    photos?: string[];
    availability?: boolean;
  }
) => {
  // Find the review
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  // Verify ownership
  if (review.shopper.toString() !== shopperId) {
    throw new AppError("Unauthorized to update this review", 403);
  }

  // Verify review belongs to the correct item and catalogue
  if (review.item.toString() !== itemId || review.catalogue.toString() !== catalogueId) {
    throw new AppError("Review does not belong to this item", 400);
  }

  // Verify review is active
  if (!review.isActive) {
    throw new AppError("Cannot update inactive review", 400);
  }

  // Update fields
  if (updates.rating !== undefined) review.rating = updates.rating;
  if (updates.comment !== undefined) review.comment = updates.comment;
  if (updates.photos !== undefined) review.photos = updates.photos;
  if (updates.availability !== undefined) review.availability = updates.availability;

  await review.save();

  logger.info(`Review ${reviewId} updated by shopper ${shopperId}`);

  return { success: true, message: "Review updated successfully" };
};

/**
 * Delete Own Review
 */
export const deleteReview = async (shopperId: string, catalogueId: string, itemId: string, reviewId: string) => {
  // Find the review
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  // Verify ownership
  if (review.shopper.toString() !== shopperId) {
    throw new AppError("Unauthorized to delete this review", 403);
  }

  // Verify review belongs to the correct item and catalogue
  if (review.item.toString() !== itemId || review.catalogue.toString() !== catalogueId) {
    throw new AppError("Review does not belong to this item", 400);
  }

  // Soft delete
  review.isActive = false;
  await review.save();

  logger.info(`Review ${reviewId} deleted by shopper ${shopperId}`);

  return { success: true, message: "Review deleted successfully" };
};
