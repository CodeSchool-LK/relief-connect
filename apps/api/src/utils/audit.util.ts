import { Request } from 'express';
import { AuditAction } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Create audit log details object
 */
export interface AuditLogDetails {
  action: AuditAction;
  resourceType?: string;
  resourceId?: number | string;
  details?: Record<string, unknown>;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Helper function to create audit log details
 */
export function createAuditLogDetails(
  action: AuditAction,
  resourceType?: string,
  resourceId?: number | string,
  details?: Record<string, unknown>
): Omit<AuditLogDetails, 'userId' | 'ipAddress' | 'userAgent'> {
  return {
    action,
    resourceType,
    resourceId,
    details,
  };
}

