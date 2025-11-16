import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { authenticate, validate, authLimiter } from "../middleware";
import { googleLogin } from "../controllers/googleAuthController";
import { verifyEmail, resendVerifyEmail } from "../controllers/verifyEmailController";
import { forgotPassword, resetPassword } from "../controllers/passwordController";
import { changePassword } from "../controllers/authController";

// ...
import multer from "multer";
import path from "path";
const router = express.Router();

router.get("/_debug", (_req, res) => {
  res.json({ ok: true, where: "auth router" });
});

// ---- Multer setup for avatars (memory storage for Base64) ----
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for Base64 conversion
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    // Only allow image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

//Google Login
router.post("/google/login", googleLogin); // <-- add this
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
 * GET/PUT /api/auth/profile
 */
router.get("/profile", authenticate, authController.getProfile);
router.put(
  "/profile",
  authenticate,
  upload.single("avatar"), 
  authController.updateProfile
);



/**
 * GET /api/auth/verify
 * Verify token
 */
router.get("/verify", authenticate, authController.verifyToken);

router.post(
  "/password/change",
  authenticate,
  validate([
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Must contain at least one number"),
  ]),
  changePassword
);
/**
 * POST /api/auth/logout
 * Logout
 */
router.post("/logout", authenticate, authController.logout);

// Email verification routes
router.get("/verify-email", verifyEmail);
router.post("/verify-email/resend", resendVerifyEmail);
// Password reset routes
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);

export default router;
