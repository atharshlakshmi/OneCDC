import express from "express";
import { body } from "express-validator";
import * as cartController from "../controllers/cartController";
import { authenticate, authorize, validate } from "../middleware";
import { UserRole } from "../types";

const router = express.Router();

// All cart routes require registered shopper authentication
router.use(authenticate, authorize(UserRole.REGISTERED_SHOPPER));

/**
 * GET /api/cart
 * Get user's cart
 */
router.get("/", cartController.getCart);

/**
 * POST /api/cart/add
 * Add shop to cart
 */
router.post(
  "/add",
  validate([body("shopId").isMongoId().withMessage("Valid shop ID is required"), body("itemTag").optional().isString().withMessage("Item tag must be a string")]),
  cartController.addToCart
);

/**
 * DELETE /api/cart/remove/:shopId
 * Remove shop from cart
 */
router.delete("/remove/:shopId", cartController.removeFromCart);

/**
 * DELETE /api/cart/clear
 * Clear cart
 */
router.delete("/clear", cartController.clearCart);

/**
 * POST /api/cart/generate-route
 * Generate most efficient route
 */
router.post(
  "/generate-route",
  validate([
    body("origin.lat").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude is required"),
    body("origin.lng").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude is required"),
    body("mode").optional().isIn(["walking", "driving", "transit"]).withMessage("Valid transport mode is required"),
  ]),
  cartController.generateRoute
);

export default router;
