/**
 * useFormValidation hook
 * Reusable form validation logic
 */

import { useState, useCallback } from "react";
import { EMAIL_REGEX, PASSWORD_MIN_LENGTH, PASSWORD_RULES } from "../lib/constants";
import type { PasswordValidation } from "../lib/types";

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    if (!email) {
      setError("email", "Email is required");
      return false;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError("email", "Please enter a valid email address");
      return false;
    }

    clearError("email");
    return true;
  }, [setError, clearError]);

  const validatePassword = useCallback((password: string): PasswordValidation => {
    const validation: PasswordValidation = {
      hasMinLength: password.length >= PASSWORD_MIN_LENGTH,
      hasUpperCase: PASSWORD_RULES.upper.test(password),
      hasLowerCase: PASSWORD_RULES.lower.test(password),
      hasDigit: PASSWORD_RULES.digit.test(password),
      isValid: false,
    };

    validation.isValid =
      validation.hasMinLength &&
      validation.hasUpperCase &&
      validation.hasLowerCase &&
      validation.hasDigit;

    if (!validation.isValid) {
      const messages: string[] = [];
      if (!validation.hasMinLength) {
        messages.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
      }
      if (!validation.hasUpperCase) messages.push("one uppercase letter");
      if (!validation.hasLowerCase) messages.push("one lowercase letter");
      if (!validation.hasDigit) messages.push("one digit");

      setError("password", `Password must contain ${messages.join(", ")}`);
    } else {
      clearError("password");
    }

    return validation;
  }, [setError, clearError]);

  const validateRequired = useCallback((field: string, value: string, label?: string): boolean => {
    if (!value || value.trim() === "") {
      setError(field, `${label || field} is required`);
      return false;
    }
    clearError(field);
    return true;
  }, [setError, clearError]);

  const validateMatch = useCallback((
    field1: string,
    field2: string,
    value1: string,
    value2: string,
    label?: string
  ): boolean => {
    if (value1 !== value2) {
      setError(field2, `${label || "Values"} do not match`);
      return false;
    }
    clearError(field2);
    return true;
  }, [setError, clearError]);

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    validateEmail,
    validatePassword,
    validateRequired,
    validateMatch,
  };
}
