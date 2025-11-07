/**
 * Error handling utilities
 * Centralized error handling and messaging
 */

import { toast } from "sonner";

/**
 * Extract a user-friendly error message from an unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "An unexpected error occurred";
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("NetworkError") ||
      error.name === "NetworkError"
    );
  }
  return false;
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("401") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("authentication") ||
      error.message.includes("token")
    );
  }
  return false;
}

/**
 * Handle API errors with toast notifications
 */
export function handleApiError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);

  if (isNetworkError(error)) {
    toast.error("Network error. Please check your connection and try again.");
  } else if (isAuthError(error)) {
    toast.error("Authentication failed. Please log in again.");
  } else {
    toast.error(message);
  }
}

/**
 * Handle form validation errors
 */
export function handleValidationError(field: string, message: string): void {
  toast.error(`${field}: ${message}`);
}

/**
 * Log error to console in development
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  }
}

/**
 * Handle errors with logging and toast notification
 */
export function handleError(
  error: unknown,
  context?: string,
  customMessage?: string
): void {
  logError(error, context);
  handleApiError(error, customMessage);
}
