/**
 * Validate Singapore phone number
 */
export const validateSingaporePhone = (phone: string): boolean => {
  const phoneRegex = /^[689]\d{7}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate time format (HH:mm)
 */
export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Validate rating (1-5)
 */
export const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

/**
 * Validate day of week (0-6)
 */
export const validateDayOfWeek = (day: number): boolean => {
  return Number.isInteger(day) && day >= 0 && day <= 6;
};

/**
 * Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Validate Business Registration Number (UEN)
 * Simplified validation for Singapore UEN format
 */
export const validateBusinessRegistration = (uen: string): boolean => {
  if (!uen) return false;
  const normalized = uen.trim().toUpperCase();

  // Singapore UEN formats:
  //  - Businesses: 9 digits + 1 letter  → 12345678X
  //  - Local companies: 10 digits + 1 letter → 201912345K
  //  - New entities: TYYPQ9999X, RYYPQ9999X, SYYPQ9999X
  const uenRegex = /^(?:\d{8}[A-Z]|[0-9]{10}[A-Z]|[TSR]\d{2}[A-Z]{2,3}\d{4}[A-Z])$/;

  return uenRegex.test(normalized);
};
