/**
 * Application-wide constants
 * Centralized configuration values used throughout the application
 */

// Authentication & Validation
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_RULES = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /\d/,
};
export const EMAIL_REGEX = /^(?:[a-zA-Z0-9_'^&+%`{}~|-]+(?:\.[a-zA-Z0-9_'^&+%`{}~|-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

// Geolocation
export const DEFAULT_LOCATION = {
  lat: 1.3521,
  lng: 103.8198,
  name: "Singapore",
};

// API Configuration
export const API_TIMEOUT = 10000; // 10 seconds

// Toast Configuration
export const TOAST_DURATION = 3000; // 3 seconds
export const TOAST_NAVIGATION_DELAY = 500; // 0.5 seconds

// User Roles (must match backend enum values)
export const USER_ROLES = {
  GUEST: "guest",
  REGISTERED_SHOPPER: "registered_shopper",
  OWNER: "owner",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  CART: "cart",
} as const;
