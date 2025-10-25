import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Custom Error Class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Handler Middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    logger.error({
      message: 'Validation Error',
      error: err.message,
      url: req.url,
    });

    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: [err.message],
    });
    return;
  }

  // Handle Mongoose Cast Error
  if (err.name === 'CastError') {
    logger.error({
      message: 'Invalid ID format',
      error: err.message,
      url: req.url,
    });

    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // Handle Duplicate Key Error
  if (err.name === 'MongoServerError' && 'code' in err && err.code === 11000) {
    logger.error({
      message: 'Duplicate key error',
      error: err.message,
      url: req.url,
    });

    res.status(409).json({
      success: false,
      message: 'Duplicate entry. Resource already exists',
    });
    return;
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  // Default Error
  logger.error({
    message: 'Unhandled Error',
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Async Handler Wrapper
 * Catches async errors and passes to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
