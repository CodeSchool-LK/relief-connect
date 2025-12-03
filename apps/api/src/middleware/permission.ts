import { Request, Response, NextFunction } from 'express';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permission.util';

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
 * Require a specific permission
 * User must be authenticated and have the specified permission
 * 
 * Usage:
 * router.get('/endpoint', authenticate, requirePermission(Permission.MANAGE_USERS), controller.method);
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      if (isBrowserRequest(req)) {
        res.redirect(process.env.LOGIN_URL || '/login');
        return;
      }
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        redirectTo: process.env.LOGIN_URL || '/login',
      });
      return;
    }

    // Check if user has the required permission
    if (!hasPermission(req.user, permission)) {
      if (isBrowserRequest(req)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Access denied.',
          message: `This action requires the following permission: ${permission}`,
        });
        return;
      }
      res.sendError(`Insufficient permissions. Required permission: ${permission}`, 403);
      return;
    }

    // User is authenticated AND has the required permission - proceed
    next();
  };
}

/**
 * Require any of the specified permissions (OR logic)
 * User must be authenticated and have at least one of the specified permissions
 * 
 * Usage:
 * router.get('/endpoint', authenticate, requireAnyPermission(Permission.VIEW_USERS, Permission.MANAGE_USERS), controller.method);
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      if (isBrowserRequest(req)) {
        res.redirect(process.env.LOGIN_URL || '/login');
        return;
      }
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        redirectTo: process.env.LOGIN_URL || '/login',
      });
      return;
    }

    // Check if user has at least one of the required permissions
    if (!hasAnyPermission(req.user, ...permissions)) {
      if (isBrowserRequest(req)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Access denied.',
          message: `This action requires one of the following permissions: ${permissions.join(', ')}`,
        });
        return;
      }
      res.sendError(`Insufficient permissions. Required one of: ${permissions.join(', ')}`, 403);
      return;
    }

    // User is authenticated AND has at least one of the required permissions - proceed
    next();
  };
}

/**
 * Require all of the specified permissions (AND logic)
 * User must be authenticated and have all of the specified permissions
 * 
 * Usage:
 * router.get('/endpoint', authenticate, requireAllPermissions(Permission.VIEW_USERS, Permission.MANAGE_USERS), controller.method);
 */
export function requireAllPermissions(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      if (isBrowserRequest(req)) {
        res.redirect(process.env.LOGIN_URL || '/login');
        return;
      }
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        redirectTo: process.env.LOGIN_URL || '/login',
      });
      return;
    }

    // Check if user has all of the required permissions
    if (!hasAllPermissions(req.user, ...permissions)) {
      if (isBrowserRequest(req)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Access denied.',
          message: `This action requires all of the following permissions: ${permissions.join(', ')}`,
        });
        return;
      }
      res.sendError(`Insufficient permissions. Required all of: ${permissions.join(', ')}`, 403);
      return;
    }

    // User is authenticated AND has all of the required permissions - proceed
    next();
  };
}

