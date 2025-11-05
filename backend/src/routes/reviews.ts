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
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").notEmpty().withMessage("Comment is required").isLength({ max: 1000 }).withMessage("Comment must not exceed 1000 characters"),
    body("availability").isBoolean().withMessage("Availability must be a boolean"),
    body("photos").optional().isArray({ max: 5 }).withMessage("Maximum 5 photos allowed"),
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
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isLength({ max: 1000 }).withMessage("Comment must not exceed 1000 characters"),
    body("availability").optional().isBoolean().withMessage("Availability must be a boolean"),
    body("photos").optional().isArray({ max: 5 }).withMessage("Maximum 5 photos allowed"),
  ]),
  reviewController.updateReview
);

/**
 * DELETE /api/reviews/:catalogueId/:itemId/:reviewId
 * Delete own review
 */
router.delete("/:catalogueId/:itemId/:reviewId", authenticate, authorize(UserRole.REGISTERED_SHOPPER), reviewController.deleteReview);

export default router;
