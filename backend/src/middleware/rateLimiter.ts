import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Review Submission Rate Limiter
 * Stricter limit to prevent spam
 */
export const reviewLimiter = rateLimit({
  windowMs: parseInt(process.env.REVIEW_RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.REVIEW_RATE_LIMIT_MAX || '5'),
  message: {
    success: false,
    message: 'Too many reviews submitted, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Report Submission Rate Limiter
 */
export const reportLimiter = rateLimit({
  windowMs: parseInt(process.env.REPORT_RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.REPORT_RATE_LIMIT_MAX || '10'),
  message: {
    success: false,
    message: 'Too many reports submitted, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Rate Limiter
 * For login/register endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
