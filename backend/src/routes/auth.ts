import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { authenticate, validate, authLimiter } from "../middleware";

console.log("[AUTH ROUTER] loaded"); // <— should print on server start
const router = express.Router();

router.get("/_debug", (_req, res) => {
  res.json({ ok: true, where: "auth router" });
});
/**
 * POST /api/auth/register/shopper
 * Register new shopper
 */
router.post(
  "/register/shopper",
  authLimiter,
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number"),
    body("name").notEmpty().withMessage("Name is required"),
    body("phone")
      .optional()
      .matches(/^[689]\d{7}$/)
      .withMessage("Valid Singapore phone number is required"),
    body("nric").notEmpty().withMessage("NRIC is required for Singpass verification"),
  ]),
  authController.registerShopper
);

/**
 * POST /api/auth/register/owner
 * Register new owner
 */
router.post(
  "/register/owner",
  authLimiter,
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number"),
    body("name").notEmpty().withMessage("Name is required"),
    body("phone")
      .optional()
      .matches(/^[689]\d{7}$/)
      .withMessage("Valid Singapore phone number is required"),
    body("businessRegistrationNumber").notEmpty().withMessage("Business registration number is required for Corppass verification"),
  ]),
  authController.registerOwner
);

/**
 * POST /api/auth/login
 * Login
 */
router.post(
  "/login",
  authLimiter,
  validate([body("email").isEmail().withMessage("Valid email is required"), body("password").notEmpty().withMessage("Password is required")]),
  authController.login
);

/**
 * GET /api/auth/profile
 * Get user profile
 */
router.get("/profile", authenticate, authController.getProfile);

/**
 * GET /api/auth/verify
 * Verify token
 */
router.get("/verify", authenticate, authController.verifyToken);

/**
 * POST /api/auth/logout
 * Logout
 */
router.post("/logout", authenticate, authController.logout);

export default router;
