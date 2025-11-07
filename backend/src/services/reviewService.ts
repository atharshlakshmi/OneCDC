import { Catalogue, Item, Review } from '../models';
import { AppError } from '../middleware';
import logger from '../utils/logger';

/**
 * Submit Review (Use Case #2-3)
 */
export const submitReview = async (
  shopperId: string,
  catalogueId: string,
  itemName: string,
  reviewData: {
    description: string;
    images?: string[];
    availability: boolean;
  }
) => {
  // Verify catalogue exists
  const catalogue = await Catalogue.findById(catalogueId).populate('items');
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Find item by name in Item collection
  const item = await Item.findOne({
    _id: { $in: catalogue.items },
    name: itemName
  });
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Create review using standalone Review model
  try {
    const reviewDoc = {
      shopper: shopperId,
      item: itemName, // Using item name as identifier
      catalogue: catalogueId,
      shop: catalogue.shop,
      description: reviewData.description,
      images: reviewData.images || [],
      availability: reviewData.availability,
    };

    logger.info(`Attempting to create review with data: ${JSON.stringify(reviewDoc)}`);

    const review = await Review.create(reviewDoc);

    logger.info(`Review submitted for item ${itemName} by shopper ${shopperId}`);

    return {
      success: true,
      message: 'Review submitted successfully',
      data: review
    };
  } catch (error: any) {
    logger.error(`Failed to create review: ${error.message}`);
    logger.error(`Error details: ${JSON.stringify(error)}`);

    if (error.code === 11000) {
      // Duplicate key error (unique constraint on item + shopper)
      throw new AppError('You have already reviewed this item', 409);
    }
    throw error;
  }
};

/**
 * Get Reviews for Item
 */
export const getItemReviews = async (catalogueId: string, itemId: string) => {
  // Verify catalogue exists
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Find item directly from Item collection
  const item = await Item.findOne({
    _id: itemId,
    _id: { $in: catalogue.items }
  }).populate('reviews.shopper', 'name');

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
  // Verify catalogue exists
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Find item directly from Item collection
  const item = await Item.findOne({
    _id: itemId,
    _id: { $in: catalogue.items }
  });
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

  await item.save();

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
  // Verify catalogue exists
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Find item directly from Item collection
  const item = await Item.findOne({
    _id: itemId,
    _id: { $in: catalogue.items }
  });
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

  await item.save();

  logger.info(`Review ${reviewId} deleted by shopper ${shopperId}`);

  return { success: true, message: 'Review deleted successfully' };
};
