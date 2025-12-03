import { Permission, UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Check if user has a specific permission
 * ADMIN role users have full access without explicit permissions
 */
export function hasPermission(
  userPermissions: Permission[] | undefined,
  permission: Permission,
  userRole?: UserRole
): boolean {
  // ADMIN role has full access to everything without explicit permissions
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 * ADMIN role users have full access without explicit permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[] | undefined,
  userRole: UserRole | undefined,
  ...permissions: Permission[]
): boolean {
  // ADMIN role has full access to everything without explicit permissions
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  if (!userPermissions || !Array.isArray(userPermissions) || permissions.length === 0) {
    return false;
  }
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 * ADMIN role users have full access without explicit permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[] | undefined,
  userRole: UserRole | undefined,
  ...permissions: Permission[]
): boolean {
  // ADMIN role has full access to everything without explicit permissions
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  if (!userPermissions || !Array.isArray(userPermissions) || permissions.length === 0) {
    return false;
  }
  return permissions.every(permission => userPermissions.includes(permission));
}

