import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import { User, RegisteredShopper } from "../models/User";
import { generateToken } from "../utils/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Google Login Controller
 * POST /api/auth/google/login
 */
export const googleLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { credential } = req.body as { credential?: string };

  if (!credential) {
    res.status(400).json({ success: false, message: "Missing credential" });
    return;
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(401).json({ success: false, message: "Invalid Google token payload" });
      return;
    }

    // Check or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await RegisteredShopper.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        isActive: true,
        authProvider: "google",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        singpassVerified: false,
        corppassVerified: false,
        avatarUrl: payload.picture || "", // optional
      });
    } else {
      // Existing user but unverified? Verify now.
      if (!user.emailVerified) {
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
      }

      if (!user.authProvider) user.authProvider = "google"; // update if missing
      await user.save();
    }

    // Generate token using your existing helper
    const token = generateToken({
      id: user.id.toString(), // ensure string for JWT payload
      email: user.email,
      role: user.role,
    });

    // Send success response
    res.status(200).json({
      success: true,
      data: { user, token },
      message: "Google login successful",
    });
  } catch (error) {
    console.error("Google login error:", error);

    // Use 401 for invalid credentials or origin mismatch
    res.status(401).json({
      success: false,
      message: "Invalid Google credential (origin mismatch or expired token)",
    });
  }
});
