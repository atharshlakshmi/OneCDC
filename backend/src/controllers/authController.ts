import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware';
import * as authService from '../services/authService';

/**
 * Register Shopper
 * POST /api/auth/register/shopper
 */
export const registerShopper = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email, password, name, phone, nric, address } = req.body;

    const result = await authService.registerShopper({
      email,
      password,
      name,
      phone,
      nric,
      address,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Shopper registered successfully',
    });
  }
);

/**
 * Register Owner
 * POST /api/auth/register/owner
 */
export const registerOwner = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email, password, name, phone, businessRegistrationNumber } =
      req.body;

    const result = await authService.registerOwner({
      email,
      password,
      name,
      phone,
      businessRegistrationNumber,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Owner registered successfully',
    });
  }
);

/**
 * Login
 * POST /api/auth/login
 */
export const login = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  }
);

/**
 * Get Profile
 * GET /api/auth/profile
 */
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

/**
 * Verify Token
 * GET /api/auth/verify
 */
export const verifyToken = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // If we reach here, token is valid (middleware authenticated)
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
      message: 'Token is valid',
    });
  }
);

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    // With JWT, logout is handled client-side by removing token
    // Server can optionally blacklist tokens (requires Redis or similar)
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
);
