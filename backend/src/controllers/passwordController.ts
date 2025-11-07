import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as passwordService from '../services/passwordService';

/**
 * POST /api/auth/password/forgot
 * Body: { email }
 * Always responds 200 to avoid user enumeration. If user exists, emails a reset link with short-lived token.
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as { email?: string };

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    // Service layer handles the logic
    await passwordService.sendPasswordResetEmail(email);

    // Always return 200 to prevent user enumeration
    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });
  }
);

/**
 * POST /api/auth/password/reset
 * Body: { token, newPassword }
 * Verifies token and sets a new password.
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body as {
      token?: string;
      newPassword?: string;
    };

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
      return;
    }

    // Service layer handles validation and password reset
    await passwordService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password has been reset. You can now log in.',
    });
  }
);
