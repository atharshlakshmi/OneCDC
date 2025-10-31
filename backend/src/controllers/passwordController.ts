import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { sendMail } from "../utils/mailer";
import { makePasswordResetToken, verifyPasswordResetToken } from "../utils/emailToken";

/** Basic password policy: 8+ chars, 1 upper, 1 lower, 1 number */
function validatePassword(pw: string) {
  const errors: string[] = [];
  if (!pw || pw.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(pw)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(pw)) errors.push("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(pw)) errors.push("Password must contain at least one number");
  return errors;
}

/**
 * POST /api/auth/password/forgot
 * Body: { email }
 * Always responds 200 to avoid user enumeration. If user exists, emails a reset link with short-lived token.
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });

  if (user) {
    const token = makePasswordResetToken(user.id.toString());
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await sendMail({
      to: user.email,
      subject: "Reset your OneCDC password",
      html: `
        <p>Hi ${user.name || "there"},</p>
        <p>Click the link below to set a new password (valid for 30 minutes):</p>
        <p><a href="${resetUrl}" target="_blank" rel="noreferrer">Reset my password</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });
  }

  // Always 200
  res.status(200).json({
    success: true,
    message: "If the email exists, a reset link has been sent",
  });
});

/**
 * POST /api/auth/password/reset
 * Body: { token, newPassword }
 * Verifies token and sets a new password.
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };

  if (!token || !newPassword) {
    res.status(400).json({ success: false, message: "Token and new password are required" });
    return;
  }

  const pwErrors = validatePassword(newPassword);
  if (pwErrors.length) {
    res.status(400).json({ success: false, message: "Validation failed", errors: pwErrors });
    return;
  }

  try {
    const payload = verifyPasswordResetToken(token);
    if (payload.purpose !== "pwd_reset") {
      res.status(400).json({ success: false, message: "Invalid token" });
      return;
    }

    const user = await User.findById(payload.uid);
    if (!user || !user.isActive) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password has been reset. You can now log in." });
  } catch {
    res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
});
