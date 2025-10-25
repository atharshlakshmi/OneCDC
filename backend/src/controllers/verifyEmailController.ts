import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../models/User";
import { makeEmailVerifyToken, verifyEmailVerifyToken } from "../utils/emailToken";
import { sendMail } from "../utils/mailer";

/**
 * GET /api/auth/verify-email?token=...
 * Verifies a user's email using a signed token.
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = String(req.query.token || "");
  if (!token) {
    res.status(400).json({ success: false, message: "Missing token" });
    return;
  }

  try {
    const payload = verifyEmailVerifyToken(token);
    if (payload.purpose !== "email_verify") {
      res.status(400).json({ success: false, message: "Invalid token" });
      return;
    }

    const user = await User.findById(payload.uid);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.emailVerified) {
      res.status(200).json({ success: true, message: "Already verified" });
      return;
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: "Email verified" });
  } catch {
    res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
});

/**
 * POST /api/auth/verify-email/resend
 * Body: { email: string }
 * Sends (or re-sends) a verification email.
 */
export const resendVerifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (user.emailVerified) {
    res.status(200).json({ success: true, message: "Already verified" });
    return;
  }

  const token = makeEmailVerifyToken(user.id.toString());
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await sendMail({
    to: user.email,
    subject: "Verify your OneCDC account",
    html: `
      <p>Hi ${user.name || "there"},</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}" target="_blank" rel="noreferrer">Verify my email</a></p>
    `,
  });

  res.status(200).json({ success: true, message: "Verification email sent" });
});
