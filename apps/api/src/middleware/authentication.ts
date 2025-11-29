import { Request, Response, NextFunction } from 'express';
import { IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces/user/IUser';
import { UserStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { UserDao } from '../dao';
import { JwtUtil } from '../utils';

/**
 * Extends Express Request to include authenticated user
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request object
 * 
 * Usage:
 * router.get('/protected', authenticate, controller.method);
 * 
 * The user will be available in controllers as req.user
 */
/**
 * Check if request is from a browser (HTML request) vs API client (JSON request)
 */
function isBrowserRequest(req: Request): boolean {
  const acceptHeader = req.headers.accept || '';
  const contentType = req.headers['content-type'] || '';
  
  // If explicitly accepts JSON, it's an API client
  if (acceptHeader.includes('application/json')) {
    return false;
  }
  
  // If Content-Type is application/json, it's likely an API client
  if (contentType.includes('application/json')) {
    return false;
  }
  
  // If has x-requested-with header (AJAX), it's an API client
  if (req.headers['x-requested-with']) {
    return false;
  }
  
  // Otherwise, assume it's a browser request
  return true;
}

/**
 * Get login URL from environment or use default
 */
function getLoginUrl(): string {
  return process.env.LOGIN_URL || '/login';
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Check if it's a browser request - redirect to login
      if (isBrowserRequest(req)) {
        res.redirect(getLoginUrl());
        return;
      }
      // For API clients, return JSON error with redirect hint
      res.status(401).json({
        success: false,
        error: 'Authorization header is missing',
        redirectTo: getLoginUrl(),
      });
      return;
    }

    // Check if Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      if (isBrowserRequest(req)) {
        res.redirect(getLoginUrl());
        return;
      }
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format. Expected: Bearer <token>',
        redirectTo: getLoginUrl(),
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = JwtUtil.verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      if (isBrowserRequest(req)) {
        res.redirect(getLoginUrl());
        return;
      }
      res.status(401).json({
        success: false,
        error: 'Invalid or expired access token',
        redirectTo: getLoginUrl(),
      });
      return;
    }

    // Fetch user from database
    const userDao = UserDao.getInstance();
    const user = await userDao.findById(decoded.id);

    if (!user) {
      if (isBrowserRequest(req)) {
        res.redirect(getLoginUrl());
        return;
      }
      res.status(401).json({
        success: false,
        error: 'User not found',
        redirectTo: getLoginUrl(),
      });
      return;
    }

    // Check if user account is active
    if (user.status !== UserStatus.ACTIVE) {
      res.sendError('Account is disabled. Please contact administrator', 403);
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    if (isBrowserRequest(req)) {
      res.redirect(getLoginUrl());
      return;
    }
    res.sendError('Authentication failed', 500);
  }
}

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't fail if token is missing
 * Useful for endpoints that work with or without authentication
 * 
 * Usage:
 * router.get('/optional', optionalAuthenticate, controller.method);
 * 
 * The user will be available in controllers as req.user (may be undefined)
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // If no authorization header, continue without user
    if (!authHeader) {
      next();
      return;
    }

    // Check if Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Invalid format, but continue without user (optional auth)
      next();
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = JwtUtil.verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      // Invalid token, but continue without user (optional auth)
      next();
      return;
    }

    // Fetch user from database
    const userDao = UserDao.getInstance();
    const user = await userDao.findById(decoded.id);

    if (user && user.status === UserStatus.ACTIVE) {
      // Attach user to request object if valid
      req.user = user;
    }
    // Continue regardless of whether user was found or active
    next();
  } catch (error) {
    console.error('Error in optional authentication middleware:', error);
    // Continue even on error (optional auth)
    next();
  }
}

