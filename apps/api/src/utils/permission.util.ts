import { IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces/user/IUser';
import { Permission, UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Check if user has a specific permission
 * ADMIN role users have full access without explicit permissions
 * SYSTEM_ADMINISTRATOR role users need explicit permissions
 * 
 * @param user - User object to check
 * @param permission - Permission to check for
 * @returns true if user has the permission, false otherwise
 */
export function hasPermission(user: IUser | undefined, permission: Permission): boolean {
  if (!user) {
    return false;
  }

  // ADMIN role has full access to everything without explicit permissions
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  // SYSTEM_ADMINISTRATOR role needs explicit permissions
  if (user.role !== UserRole.SYSTEM_ADMINISTRATOR) {
    return false;
  }

  // Check if user has permissions array and it includes the required permission
  if (!user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }

  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 * ADMIN role users have full access without explicit permissions
 * 
 * @param user - User object to check
 * @param permissions - Array of permissions to check
 * @returns true if user has at least one of the permissions, false otherwise
 */
export function hasAnyPermission(user: IUser | undefined, ...permissions: Permission[]): boolean {
  if (!user) {
    return false;
  }

  // ADMIN role has full access to everything without explicit permissions
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 * ADMIN role users have full access without explicit permissions
 * 
 * @param user - User object to check
 * @param permissions - Array of permissions to check
 * @returns true if user has all of the permissions, false otherwise
 */
export function hasAllPermissions(user: IUser | undefined, ...permissions: Permission[]): boolean {
  if (!user) {
    return false;
  }

  // ADMIN role has full access to everything without explicit permissions
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Get all permissions for a user
 * ADMIN role users don't need explicit permissions (they have all)
 * 
 * @param user - User object
 * @returns Array of permissions or empty array
 */
export function getUserPermissions(user: IUser | undefined): Permission[] {
  if (!user) {
    return [];
  }

  // ADMIN role has full access, but we return empty array since they don't need explicit permissions
  if (user.role === UserRole.ADMIN) {
    return [];
  }

  // SYSTEM_ADMINISTRATOR role has explicit permissions
  if (user.role === UserRole.SYSTEM_ADMINISTRATOR) {
    return user.permissions || [];
  }

  return [];
}

