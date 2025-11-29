import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Authorization middleware
 * Checks if the authenticated user has one of the required roles
 * Must be used after authenticate middleware
 * 
 * Usage:
 * router.get('/admin-only', authenticate, authorize(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR), controller.method);
 * 
 * The user must be authenticated (req.user must exist) before this middleware runs
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      res.sendError('Authentication required', 401);
      return;
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.sendError('Insufficient permissions. Access denied.', 403);
      return;
    }

    next();
  };
}

/**
 * Require system administrator or admin role
 * Helper function for admin-only routes
 */
export function requireAdmin() {
  return authorize(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMIN);
}

/**
 * Require volunteer club role
 * Helper function for volunteer club-only routes
 */
export function requireVolunteerClub() {
  return authorize(UserRole.VOLUNTEER_CLUB);
}

/**
 * Require system administrator, admin, or volunteer club role
 * Helper function for routes accessible to admins or volunteer clubs
 */
export function requireAdminOrVolunteerClub() {
  return authorize(UserRole.SYSTEM_ADMINISTRATOR, UserRole.ADMIN, UserRole.VOLUNTEER_CLUB);
}

/**
 * Require any authenticated user
 * Helper function for routes that require authentication but no specific role
 */
export function requireAuthenticated() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.sendError('Authentication required', 401);
      return;
    }
    next();
  };
}

