import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';

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

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // FIRST: Check if user is authenticated (should be set by authenticate middleware)
    // If not authenticated, redirect to login (this is the only case where we redirect)
    if (!req.user) {
      if (isBrowserRequest(req)) {
        res.redirect(getLoginUrl());
        return;
      }
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        redirectTo: getLoginUrl(),
      });
      return;
    }

    // SECOND: User is authenticated, now check if they have the required role
    // If authenticated but wrong role, return 403 error (DO NOT redirect to login)
    if (!allowedRoles.includes(req.user.role)) {
      // User is authenticated but doesn't have the required role
      // Return 403 Forbidden - do NOT redirect to login
      if (isBrowserRequest(req)) {
        // For browser requests, still return JSON error (frontend will handle it)
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Access denied.',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}. Your current role is: ${req.user.role}`,
        });
        return;
      }
      res.sendError('Insufficient permissions. Access denied.', 403);
      return;
    }

    // User is authenticated AND has the required role - proceed
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
      if (isBrowserRequest(req)) {
        res.redirect(getLoginUrl());
        return;
      }
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        redirectTo: getLoginUrl(),
      });
      return;
    }
    next();
  };
}

