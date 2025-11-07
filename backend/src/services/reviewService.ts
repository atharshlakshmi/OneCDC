import { Catalogue, Item, Review } from '../models';
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
    description: string;
    images?: string[];
    availability: boolean;
  }
) => {
  // Verify catalogue exists
  const catalogue = await Catalogue.findById(catalogueId).populate('items');
  if (!catalogue) {
    throw new AppError("Catalogue not found", 404);
  }

  // Find item by ID in Item collection
  const item = await Item.findOne({
    _id: itemId,
    catalogue: catalogueId
  });
  if (!item) {
    throw new AppError('Item not found in catalogue', 404);
  }

  // Create review using standalone Review model
  try {
    const reviewDoc = {
      shopper: shopperId,
      item: itemId, // Using item ID as identifier
      catalogue: catalogueId,
      shop: catalogue.shop,
      description: reviewData.description,
      images: reviewData.images || [],
      availability: reviewData.availability,
    };

    logger.info(`Attempting to create review with data: ${JSON.stringify(reviewDoc)}`);

    const review = await Review.create(reviewDoc);

    // Add review ID to item's reviews array
    item.reviews.push(review._id as any);
    await item.save();

    logger.info(`Review submitted for item ${itemId} by shopper ${shopperId}`);

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
 * Get User's Reviews
 */
export const getMyReviews = async (shopperId: string) => {
  const reviews = await Review.find({
    shopper: shopperId,
    isActive: true
  })
  .populate('catalogue', 'name')
  .populate('shop', 'name')
  .sort({ createdAt: -1 })
  .lean();

  return {
    success: true,
    data: reviews,
    total: reviews.length
  };
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

  // Find item by ID in the catalogue
  const item = await Item.findOne({
    _id: itemId,
    catalogue: catalogueId
  });

  if (!item) {
    throw new AppError('Item not found in catalogue', 404);
  }

  // Find all reviews for this item from Review collection
  const reviews = await Review.find({
    item: itemId,
    catalogue: catalogueId,
    isActive: true
  }).populate('shopper', 'name').lean();

  return {
    item: {
      id: item._id,
      name: item.name,
    },
    reviews: reviews,
    totalReviews: reviews.length,
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
  // Verify catalogue exists
  const catalogue = await Catalogue.findById(catalogueId);
  if (!catalogue) {
    throw new AppError('Catalogue not found', 404);
  }

  // Find review from Review collection
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

  // Find review from Review collection
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
