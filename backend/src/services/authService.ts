import { User, RegisteredShopper, Owner } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../types';
import { AppError } from '../middleware';
import logger from '../utils/logger';

/**
 * Mock Singpass Verification
 * In production, this would call the actual Singpass API
 */
const verifySingpass = async (nric: string): Promise<boolean> => {
  // Mock implementation
  logger.info(`Mock Singpass verification for NRIC: ${nric}`);
  // In production: call actual Singpass API
  return true;
};

/**
 * Mock Corppass Verification
 * In production, this would call the actual Corppass API
 */
const verifyCorppass = async (uen: string): Promise<boolean> => {
  // Mock implementation
  logger.info(`Mock Corppass verification for UEN: ${uen}`);
  // In production: call actual Corppass API
  return true;
};

/**
 * Register Shopper (Use Case #6-1)
 */
export const registerShopper = async (data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  nric: string;
  address?: string;
}) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Verify with Singpass (mock)
  const singpassVerified = await verifySingpass(data.nric);
  if (!singpassVerified) {
    throw new AppError('Singpass verification failed', 400);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create shopper
  const shopper = await RegisteredShopper.create({
    email: data.email,
    passwordHash,
    name: data.name,
    phone: data.phone,
    role: UserRole.REGISTERED_SHOPPER,
    address: data.address,
    singpassVerified: true,
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
export const registerOwner = async (data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessRegistrationNumber: string;
}) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Check if UEN already registered
  const existingOwner = await Owner.findOne({
    businessRegistrationNumber: data.businessRegistrationNumber,
  });
  if (existingOwner) {
    throw new AppError('Business registration number already registered', 409);
  }

  // Verify with Corppass (mock)
  const corppassVerified = await verifyCorppass(data.businessRegistrationNumber);
  if (!corppassVerified) {
    throw new AppError('Corppass verification failed', 400);
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create owner
  const owner = await Owner.create({
    email: data.email,
    passwordHash,
    name: data.name,
    phone: data.phone,
    role: UserRole.OWNER,
    businessRegistrationNumber: data.businessRegistrationNumber,
    corppassVerified: true,
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
export const login = async (email: string, password: string) => {
  // Find user
  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
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
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};
