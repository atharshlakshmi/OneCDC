import express from "express";
import { body } from "express-validator";
import * as reviewController from "../controllers/reviewController";
import { authenticate, authorize, validate, reviewLimiter } from "../middleware";
import { UserRole } from "../types";

const router = express.Router();

/**
 * GET /api/reviews/my-reviews
 * Get logged-in user's reviews
 */
router.get("/my-reviews", authenticate, authorize(UserRole.REGISTERED_SHOPPER), reviewController.getMyReviews);

/**
 * GET /api/reviews/flagged
 * Get logged-in user's flagged reviews (warnings > 0 && isActive: false)
 */
router.get("/flagged", authenticate, authorize(UserRole.REGISTERED_SHOPPER), reviewController.getFlaggedReviews);

/**
 * POST /api/reviews
 * Submit review (registered shopper only)
 */
router.post(
  "/",
  authenticate,
  authorize(UserRole.REGISTERED_SHOPPER),
  reviewLimiter,
  validate([
    body("catalogueId").isMongoId().withMessage("Valid catalogue ID is required"),
    body("itemId").isMongoId().withMessage("Valid item ID is required"),
    body("description").notEmpty().withMessage("Description is required").isLength({ max: 1000 }).withMessage("Description must not exceed 1000 characters"),
    body("availability").isBoolean().withMessage("Availability must be a boolean"),
    body("images").optional().isArray({ max: 10 }).withMessage("Maximum 10 images allowed"),
  ]),
  reviewController.submitReview
);

/**
 * GET /api/reviews/item/:catalogueId/:itemId
 * Get reviews for item
 */
router.get("/item/:catalogueId/:itemId", reviewController.getItemReviews);

/**
 * PUT /api/reviews/:catalogueId/:itemId/:reviewId
 * Update own review
 */
router.put(
  "/:catalogueId/:itemId/:reviewId",
  authenticate,
  authorize(UserRole.REGISTERED_SHOPPER),
  validate([
    body("description").optional().isLength({ max: 1000 }).withMessage("Description must not exceed 1000 characters"),
    body("availability").optional().isBoolean().withMessage("Availability must be a boolean"),
    body("images").optional().isArray({ max: 10 }).withMessage("Maximum 10 images allowed"),
  ]),
  reviewController.updateReview
);

/**
 * DELETE /api/reviews/:catalogueId/:itemId/:reviewId
 * Delete own review
 */
router.delete("/:catalogueId/:itemId/:reviewId", authenticate, authorize(UserRole.REGISTERED_SHOPPER), reviewController.deleteReview);

/**
 * GET /api/reviews/:reviewId
 * Get a single review by its ID
 */
router.get("/:reviewId", reviewController.getReviewById);

export default router;
