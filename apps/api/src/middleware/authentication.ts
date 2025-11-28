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
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.sendError('Authorization header is missing', 401);
      return;
    }

    // Check if Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.sendError('Invalid authorization header format. Expected: Bearer <token>', 401);
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = JwtUtil.verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      res.sendError('Invalid or expired access token', 401);
      return;
    }

    // Fetch user from database
    const userDao = UserDao.getInstance();
    const user = await userDao.findById(decoded.id);

    if (!user) {
      res.sendError('User not found', 401);
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

