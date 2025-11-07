import { Catalogue, Review, Shop } from "../models";
import { AppError } from "../middleware";
import logger from "../utils/logger";
import mongoose from "mongoose";

/**
 * Get User's Reviews
 */
export const getMyReviews = async (shopperId: string) => {
  // Query the Review collection directly and populate shop, catalogue, and item
  const reviews = await Review.find({
    shopper: new mongoose.Types.ObjectId(shopperId),
    isActive: true,
  })
    .populate("shop", "name")
    .populate("item", "name")
    .populate({
      path: "catalogue",
      select: "shop",
      populate: {
        path: "shop",
        select: "name",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  // Transform the data to match the expected format
  const transformedReviews = reviews.map((review: any) => ({
    _id: review._id,
    itemId: review.item?._id,
    itemName: review.item?.name || "Unknown Item",
    catalogueId: review.catalogue?._id || review.catalogue,
    shopName: review.shop?.name || review.catalogue?.shop?.name || "Unknown Shop",
    description: review.description,
    images: review.images || [],
    availability: review.availability,
    createdAt: review.createdAt,
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
    description: string;
    images?: string[];
    availability: boolean;
  }
) => {
  // Check if catalogue exists
  const catalogue = await Catalogue.findById(catalogueId).populate("shop");
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  // Get the shop from catalogue
  const shop = await Shop.findById(catalogue.shop);
  if (!shop) {
    throw new AppError("Shop not found", 404);
  }

  // Check if user already reviewed this item at this shop
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
    shop: shop._id,
    item: itemId,
    description: reviewData.description,
    images: reviewData.images || [],
    availability: reviewData.availability,
    warnings: 0,
    isActive: true,
  });

  await review.save();

  logger.info(`Review submitted for item ${itemId} at shop ${shop._id} by shopper ${shopperId}`);

  return { success: true, message: "Review submitted successfully", reviewId: review._id };
};

/**
 * Get Reviews for Item
 */
export const getItemReviews = async (_catalogueId: string, itemId: string) => {
  // Get all active reviews for this item ID
  const reviews = await Review.find({
    item: new mongoose.Types.ObjectId(itemId),
    isActive: true,
  })
    .populate("shopper", "name")
    .populate("shop", "name")
    .populate("item", "name")
    .sort({ createdAt: -1 })
    .lean();

  const totalReviews = reviews.length;

  return {
    item: {
      id: itemId,
      name: (reviews[0] as any)?.item?.name || "Unknown Item",
    },
    reviews: reviews,
    totalReviews: totalReviews,
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
    description?: string;
    images?: string[];
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
  if (updates.description !== undefined) review.description = updates.description;
  if (updates.images !== undefined) review.images = updates.images;
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
