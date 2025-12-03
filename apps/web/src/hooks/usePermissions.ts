import { useAuth } from './useAuth';
import { Permission, UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permission-utils';
import { IUser } from '../types/user';

/**
 * Hook for checking user permissions
 * ADMIN role users have full access without explicit permissions
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  
  // Use IUser type for authenticated user (when user exists and is authenticated)
  const authenticatedUser: IUser | null = isAuthenticated && user ? (user as IUser) : null;
  const userPermissions: Permission[] = authenticatedUser?.permissions || [];
  const userRole: UserRole | undefined = authenticatedUser?.role as UserRole | undefined;

  return {
    hasPermission: (permission: Permission) => hasPermission(userPermissions, permission, userRole),
    hasAnyPermission: (...permissions: Permission[]) => hasAnyPermission(userPermissions, userRole, ...permissions),
    hasAllPermissions: (...permissions: Permission[]) => hasAllPermissions(userPermissions, userRole, ...permissions),
    permissions: userPermissions,
    user: authenticatedUser,
  };
}

