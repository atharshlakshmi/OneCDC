import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../middleware";
import * as reviewService from "../services/reviewService";

/**
 * Get User's Reviews
 * GET /api/reviews/my-reviews
 */
export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shopperId = req.user!.id;
  const result = await reviewService.getMyReviews(shopperId);
  res.status(200).json(result);
});

/**
 * Submit Review
 * POST /api/reviews
 */
export const submitReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shopperId = req.user!.id;
  const { catalogueId, itemId, description, images, availability } = req.body;

  const result = await reviewService.submitReview(shopperId, catalogueId, itemId, {
    description,
    images,
    availability,
  });

  res.status(201).json(result);
});

/**
 * Get Item Reviews
 * GET /api/reviews/item/:catalogueId/:itemId
 */
export const getItemReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { catalogueId, itemId } = req.params;

  const result = await reviewService.getItemReviews(catalogueId, itemId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Update Own Review
 * PUT /api/reviews/:catalogueId/:itemId/:reviewId
 */
export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shopperId = req.user!.id;
  const { catalogueId, itemId, reviewId } = req.params;
  const updates = req.body;

  const result = await reviewService.updateReview(shopperId, catalogueId, itemId, reviewId, updates);

  res.status(200).json(result);
});

/**
 * Delete Own Review
 * DELETE /api/reviews/:catalogueId/:itemId/:reviewId
 */
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shopperId = req.user!.id;
  const { catalogueId, itemId, reviewId } = req.params;

  const result = await reviewService.deleteReview(shopperId, catalogueId, itemId, reviewId);

  res.status(200).json(result);
});

/**
 * Get User's Flagged Reviews
 * GET /api/reviews/flagged
 */
export const getFlaggedReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shopperId = req.user!.id;
  const result = await reviewService.getFlaggedReviews(shopperId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get a single review by ID
 * GET /api/reviews/:reviewId
 */
export const getReviewById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;
  const review = await reviewService.getReviewById(reviewId);
  res.status(200).json(review);
});
