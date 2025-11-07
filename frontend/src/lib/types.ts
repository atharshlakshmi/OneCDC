/**
 * Centralized TypeScript types and interfaces
 * Shared types used throughout the application
 */

import { UserRole } from "./constants";

// ============================================================================
// User Types
// ============================================================================

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  verified?: boolean;
  warnings?: Warning[];
  banned?: boolean;
  uen?: string; // for owners
  createdAt?: string;
  updatedAt?: string;
}

export interface Warning {
  id: string;
  reason: string;
  date: string;
  issuedBy?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
}

// ============================================================================
// Shop & Item Types
// ============================================================================

export interface Shop {
  _id: string;
  id?: number; // for mock data compatibility
  name: string;
  address: string;
  details?: string;
  ownerId: string;
  ownerVerified?: boolean;
  items?: Item[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  _id: string;
  id?: number; // for mock data compatibility
  name: string;
  category: string;
  description?: string;
  shopId: string;
  shopName?: string;
  shopAddress?: string;
  photo?: string;
  distance?: number;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Review & Report Types
// ============================================================================

export interface Review {
  _id: string;
  id?: number; // for mock data compatibility
  userId: string;
  userName?: string;
  itemId: string;
  shopId?: string;
  rating: number;
  comment: string;
  status?: "Available" | "Unavailable";
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  _id: string;
  id?: number; // for mock data compatibility
  reporterId: string;
  reviewId?: string;
  shopId?: string;
  reason: string;
  details?: string;
  status: "Pending" | "Resolved" | "Rejected";
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Cart Types
// ============================================================================

export interface CartItem {
  itemId: string;
  shopId: string;
  itemName: string;
  shopName: string;
  quantity?: number;
  price?: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  uen?: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// Navigation Types
// ============================================================================

export interface NavigationState {
  from?: string;
  itemId?: string;
  userId?: string;
  reviewId?: string;
  reportId?: string;
  shopId?: string;
  message?: string;
  backPath?: string;
}

// ============================================================================
// Location Types
// ============================================================================

export interface Location {
  lat: number;
  lng: number;
}

export interface LocationWithName extends Location {
  name?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRule {
  regex: RegExp;
  message: string;
}

export interface PasswordValidation {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasDigit: boolean;
  isValid: boolean;
}

// ============================================================================
// Google OAuth Types
// ============================================================================

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub?: string; // Google user ID
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

// ============================================================================
// Admin Types
// ============================================================================

export interface ModerationAction {
  action: "approve" | "reject" | "warn" | "ban";
  reason?: string;
  reportId?: string;
  userId?: string;
}

export interface ModerationLog {
  _id: string;
  moderatorId: string;
  moderatorName?: string;
  action: string;
  targetType: "user" | "review" | "shop" | "report";
  targetId: string;
  reason?: string;
  timestamp: string;
}
