import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcryptjs";

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
    // Check or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      // create a random secret so schema's passwordHash requirement is satisfied
      const randomSecret = Math.random().toString(36).slice(2) + Date.now().toString();
      const passwordHash = await bcrypt.hash(randomSecret, 10);

      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        role: "registered_shopper", // ensure this is a valid discriminator in your app
        isActive: true,
        singpassVerified: false,
        corppassVerified: false,
        // satisfy required passwordHash for local-schema validation:
        passwordHash,
        // optional: mark provider if your schema supports it:
        // authProvider: "google",
        avatarUrl: payload.picture, // optional
      });
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
