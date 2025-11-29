import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Middleware to validate API key for one-time admin account creation
 * API key should be set in environment variable ADMIN_API_KEY
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.ADMIN_API_KEY;

  if (!apiKey) {
    return next(new AppError('API key not configured. Please set ADMIN_API_KEY environment variable.', 500));
  }

  const providedApiKey = req.body.apiKey || req.headers['x-api-key'] as string;

  if (!providedApiKey) {
    return next(new AppError('API key is required', 401));
  }

  if (providedApiKey !== apiKey) {
    return next(new AppError('Invalid API key', 403));
  }

  next();
}

