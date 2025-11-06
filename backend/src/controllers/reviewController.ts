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
  const { catalogueId, itemName, description, images, availability } = req.body;

  const result = await reviewService.submitReview(shopperId, catalogueId, itemName, {
    description,
    images,
    availability,
  });

  res.status(201).json(result);
});

/**
 * Get Item Reviews
 * GET /api/reviews/item/:catalogueId/:itemName
 */
export const getItemReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { catalogueId, itemName } = req.params;

  const result = await reviewService.getItemReviews(catalogueId, itemName);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Update Own Review
 * PUT /api/reviews/:catalogueId/:itemName/:reviewId
 */
export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shopperId = req.user!.id;
  const { catalogueId, itemName, reviewId } = req.params;
  const updates = req.body;

  const result = await reviewService.updateReview(shopperId, catalogueId, itemName, reviewId, updates);

  res.status(200).json(result);
});

/**
 * Delete Own Review
 * DELETE /api/reviews/:catalogueId/:itemName/:reviewId
 */
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shopperId = req.user!.id;
  const { catalogueId, itemName, reviewId } = req.params;

  const result = await reviewService.deleteReview(shopperId, catalogueId, itemName, reviewId);

  res.status(200).json(result);
});
