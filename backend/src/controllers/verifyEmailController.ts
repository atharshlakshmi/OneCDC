import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as emailVerificationService from '../services/emailVerificationService';

/**
 * GET /api/auth/verify-email?token=...
 * Verifies a user's email using a signed token.
 */
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const token = String(req.query.token || '');
    if (!token) {
      res.status(400).json({ success: false, message: 'Missing token' });
      return;
    }

    // Service layer handles verification logic
    const user = await emailVerificationService.verifyEmailWithToken(token);

    const message = user.emailVerifiedAt
      ? 'Email verified successfully'
      : 'Email already verified';

    res.status(200).json({ success: true, message });
  }
);

/**
 * POST /api/auth/verify-email/resend
 * Body: { email: string }
 * Sends (or re-sends) a verification email.
 */
export const resendVerifyEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    // Service layer handles resend logic
    await emailVerificationService.resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  }
);
