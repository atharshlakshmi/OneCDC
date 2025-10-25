import { Catalogue } from '../models';
import { AppError } from '../middleware';
import logger from '../utils/logger';

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
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  const item = catalogue.items.id(itemId);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Check if user already reviewed
  const existingReview = item.reviews.find(
    (review: any) =>
      review.shopper.toString() === shopperId && review.isActive
  );

  if (existingReview) {
    throw new AppError('You have already reviewed this item', 409);
  }

  // Add review
  item.reviews.push({
    shopper: shopperId as any,
    rating: reviewData.rating,
    comment: reviewData.comment,
    photos: reviewData.photos || [],
    availability: reviewData.availability,
    timestamp: new Date(),
    warnings: 0,
    isActive: true,
  } as any);

  await catalogue.save();

  logger.info(`Review submitted for item ${itemId} by shopper ${shopperId}`);

  return { success: true, message: 'Review submitted successfully' };
};

/**
 * Get Reviews for Item
 */
export const getItemReviews = async (catalogueId: string, itemId: string) => {
  const catalogue = await Catalogue.findById(catalogueId).populate(
    'items.reviews.shopper',
    'name'
  );

  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  const item = catalogue.items.id(itemId);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  const activeReviews = item.reviews.filter((review: any) => review.isActive);

  return {
    item: {
      id: item._id,
      name: item.name,
    },
    reviews: activeReviews,
    totalReviews: activeReviews.length,
    averageRating: (item as any).averageRating || 0,
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
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  const item = catalogue.items.id(itemId);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  const review = (item.reviews as any).id(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Verify ownership
  if (review.shopper.toString() !== shopperId) {
    throw new AppError('Unauthorized to update this review', 403);
  }

  // Update fields
  if (updates.rating !== undefined) review.rating = updates.rating;
  if (updates.comment !== undefined) review.comment = updates.comment;
  if (updates.photos !== undefined) review.photos = updates.photos;
  if (updates.availability !== undefined)
    review.availability = updates.availability;

  await catalogue.save();

  logger.info(`Review ${reviewId} updated by shopper ${shopperId}`);

  return { success: true, message: 'Review updated successfully' };
};

/**
 * Delete Own Review
 */
export const deleteReview = async (
  shopperId: string,
  catalogueId: string,
  itemId: string,
  reviewId: string
) => {
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  const item = catalogue.items.id(itemId);
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  const review = (item.reviews as any).id(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Verify ownership
  if (review.shopper.toString() !== shopperId) {
    throw new AppError('Unauthorized to delete this review', 403);
  }

  // Soft delete
  review.isActive = false;

  await catalogue.save();

  logger.info(`Review ${reviewId} deleted by shopper ${shopperId}`);

  return { success: true, message: 'Review deleted successfully' };
};
