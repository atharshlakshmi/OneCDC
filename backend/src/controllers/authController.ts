import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../middleware";
import * as authService from "../services/authService";
import { makeEmailVerifyToken } from "../utils/emailToken";
import { sendMail } from "../utils/mailer";
/**
 * Register Shopper
 * POST /api/auth/register/shopper
 */
export const registerShopper = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, name, phone, address } = req.body;

  const result = await authService.registerShopper({
    email,
    password,
    name,
    phone,
    address,
  });

  // Send verification email (local accounts)
  const token = makeEmailVerifyToken(result.user.id.toString());
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await sendMail({
    to: result.user.email,
    subject: "Verify your OneCDC account",
    html: `
      <p>Hi ${result.user.name || "there"},</p>
      <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}" target="_blank" rel="noreferrer">Verify my email</a></p>
      <p>If you didn’t create an account, you can ignore this email.</p>
    `,
  });

  res.status(201).json({
    success: true,
    data: result,
    message: "Shopper registered successfully",
  });
});

/**
 * Register Owner
 * POST /api/auth/register/owner
 */

// --- UEN validation ---
// Matches:
// 1) Old Business: 8 digits + 1 checksum letter (e.g. 53123456X)
// 2) Local Company: 10 digits + 1 checksum letter (e.g. 201912345K)
// 3) Other Entities: T/S/R + 2 digits (year) + 2-3 letters (entity type) + 4 digits + 1 checksum letter (e.g. T12LP3456A)

export const registerOwner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, name, phone, businessRegistrationNumber } = req.body;

  const result = await authService.registerOwner({
    email,
    password,
    name,
    phone,
    businessRegistrationNumber,
  });
  // Send verification email (local accounts)
  const token = makeEmailVerifyToken(result.user.id.toString());
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await sendMail({
    to: result.user.email,
    subject: "Verify your OneCDC account",
    html: `
    <p>Hi ${result.user.name || "there"},</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}" target="_blank" rel="noreferrer">Verify my email</a></p>
  `,
  });

  res.status(201).json({
    success: true,
    data: result,
    message: "Owner registered successfully",
  });
});

/**
 * Login
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    data: result,
    message: "Login successful",
  });
});

/**
 * Get Profile
 * GET /api/auth/profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await authService.getUserProfile(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Verify Token
 * GET /api/auth/verify
 */
export const verifyToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  // If we reach here, token is valid (middleware authenticated)
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
    message: "Token is valid",
  });
});

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // With JWT, logout is handled client-side by removing token
  // Server can optionally blacklist tokens (requires Redis or similar)
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});
