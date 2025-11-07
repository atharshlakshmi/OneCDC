import { User, RegisteredShopper, Owner } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { IUser, UserAuthProvider } from '../types';
import { AppError } from '../middleware';
import logger from '../utils/logger';
import { validateBusinessRegistration } from '../utils/validators';

/**
 * Register Shopper Data Interface
 */
interface RegisterShopperData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

/**
 * Register Owner Data Interface
 */
interface RegisterOwnerData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessRegistrationNumber: string;
}

/**
 * Auth Response Interface
 */
interface AuthResponse {
  user: IUser;
  token: string;
}

/**
 * Mock Singpass Verification
 * In production, this would call the actual Singpass API
 * @deprecated This is a mock implementation. Will be replaced with actual Singpass integration.
 */
// @ts-ignore - Mock implementation for future use
const verifySingpass = async (nric: string): Promise<boolean> => {
  logger.info(`Mock Singpass verification for NRIC: ${nric}`);
  // In production: call actual Singpass API
  return true;
};

/**
 * Mock Corppass Verification
 * In production, this would call the actual Corppass API
 */
const verifyCorppass = async (uen: string): Promise<boolean> => {
  logger.info(`Mock Corppass verification for UEN: ${uen}`);
  // In production: call actual Corppass API
  return true;
};

/**
 * Register Shopper (Use Case #6-1)
 */
export const registerShopper = async (
  data: RegisterShopperData
): Promise<AuthResponse> => {
  // Normalize email to lowercase
  const normalizedEmail = data.email.toLowerCase();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create shopper
  const shopper = await RegisteredShopper.create({
    email: normalizedEmail,
    passwordHash,
    name: data.name,
    phone: data.phone,
    address: data.address,
    singpassVerified: true,
    authProvider: 'local' as UserAuthProvider,
    emailVerified: false,
    emailVerifiedAt: null,
  });

  // Generate token
  const token = generateToken({
    id: (shopper._id as any).toString(),
    email: shopper.email,
    role: shopper.role,
  });

  logger.info(`New shopper registered: ${shopper.email}`);

  return {
    user: shopper,
    token,
  };
};

/**
 * Register Owner (Use Case #6-2)
 */
export const registerOwner = async (
  data: RegisterOwnerData
): Promise<AuthResponse> => {
  // Normalize email to lowercase
  const normalizedEmail = data.email.toLowerCase();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  if (!validateBusinessRegistration(data.businessRegistrationNumber)) {
    throw new AppError(
      'Invalid UEN format. Please use a valid Singapore UEN (e.g. 201912345K or T12LP3456A).',
      400
    );
  }

  // Check if UEN already registered
  const existingOwner = await Owner.findOne({
    businessRegistrationNumber: data.businessRegistrationNumber,
  });
  if (existingOwner) {
    throw new AppError('Business registration number already registered', 409);
  }

  // Verify with Corppass (mock)
  const corppassVerified = await verifyCorppass(
    data.businessRegistrationNumber
  );
  if (!corppassVerified) {
    throw new AppError('Corppass verification failed', 400);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create owner
  const owner = await Owner.create({
    email: normalizedEmail,
    passwordHash,
    name: data.name,
    phone: data.phone,
    businessRegistrationNumber: data.businessRegistrationNumber,
    corppassVerified: true,
    authProvider: 'local' as UserAuthProvider,
    emailVerified: false,
    emailVerifiedAt: null,
  });

  // Generate token
  const token = generateToken({
    id: (owner._id as any).toString(),
    email: owner.email,
    role: owner.role,
  });

  logger.info(`New owner registered: ${owner.email}`);

  return {
    user: owner,
    token,
  };
};

/**
 * Login (Use Case #6-3)
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();

  // Find user
  const user = await User.findOne({ email: normalizedEmail, isActive: true });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Block unverified LOCAL accounts; allow Google users to pass
  if (user.authProvider === 'local' && !user.emailVerified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  // Generate token
  const token = generateToken({
    id: (user._id as any).toString(),
    email: user.email,
    role: user.role,
  });

  logger.info(`User logged in: ${user.email}`);

  return {
    user,
    token,
  };
};

/**
 * Get User Profile
 */
export const getUserProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Update User Profile
 */
export async function updateUserProfile(userId: string, patch: Partial<{ name: string; gender: string; phone: string; address: string; avatarUrl: string }>) {
  const updated = await User.findByIdAndUpdate(userId, { $set: patch }, { new: true, runValidators: true }).select("-password").lean();

  return updated;
}
