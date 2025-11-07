import { Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../types";
import { asyncHandler } from "../middleware";
import * as authService from "../services/authService";
import { makeEmailVerifyToken } from "../utils/emailToken";
import { sendMail } from "../utils/mailer";
import { User } from "../models";

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
export const registerOwner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, name, phone, businessRegistrationNumber } = req.body;

  const result = await authService.registerOwner({
    email,
    password,
    name,
    phone,
    businessRegistrationNumber,
  });

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
    data: { user },
  });
});

/**
 * Update Profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, gender, phone, address } = req.body;

  const patch: Record<string, any> = {};
  if (name !== undefined) patch.name = String(name).trim();
  if (gender !== undefined) patch.gender = String(gender).trim();
  if (phone !== undefined) patch.phone = String(phone).trim();
  if (address !== undefined) patch.address = String(address).trim();

  // Handle avatar upload
  if (req.file) {
    const base64Data = req.file.buffer.toString("base64");
    patch.avatarUrl = `data:${req.file.mimetype};base64,${base64Data}`;
  }

  if (Object.keys(patch).length === 0) {
    const current = await authService.getUserProfile(userId);
    return res.status(200).json({ success: true, data: { user: current }, message: "No changes" });
  }

  console.log('Patch object:', patch);
  const user = await authService.updateUserProfile(userId, patch);

  return res.status(200).json({
    success: true,
    data: { user },
    message: "Profile updated successfully",
  });
});

/**
 * Change Password (authenticated users)
 * POST /api/auth/password/change
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: "Both current and new passwords are required" });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: "New password must be at least 8 characters long" });
    return;
  }

  const user = await User.findById(userId).select("+passwordHash");
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (user.authProvider && user.authProvider !== "local") {
    res.status(400).json({ success: false, message: "Password cannot be changed for social login accounts" });
    return;
  }

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    res.status(400).json({ success: false, message: "Current password is incorrect" });
    return;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Verify Token
 * GET /api/auth/verify
 */
export const verifyToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
    message: "Token is valid",
  });
});

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});