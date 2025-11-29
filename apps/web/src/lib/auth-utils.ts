/**
 * Authentication Utilities
 * Helper functions for checking user roles and authentication status
 */

import { UserRole } from '../types/user';

/**
 * Get current user from localStorage (parsed from JWT token)
 * Note: This is a simple implementation - in production, you might want to decode the JWT properly
 */
export function getCurrentUser(): { id: number; role: UserRole; username: string } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return null;

    // Simple JWT decode (just for getting user info)
    // In production, use a proper JWT library
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return {
      id: payload.id,
      role: payload.role,
      username: payload.username,
    };
  } catch (error) {
    console.error('Error decoding user from token:', error);
    return null;
  }
}

/**
 * Get current user's role
 */
export function getUserRole(): UserRole | null {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken;
}

/**
 * Check if user is admin (ADMIN or SYSTEM_ADMINISTRATOR)
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'ADMIN' || role === 'SYSTEM_ADMINISTRATOR';
}

/**
 * Check if user is system administrator
 */
export function isSystemAdministrator(): boolean {
  return getUserRole() === 'SYSTEM_ADMINISTRATOR';
}

/**
 * Check if user is volunteer club
 */
export function isVolunteerClub(): boolean {
  return getUserRole() === 'VOLUNTEER_CLUB';
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserRole): boolean {
  return getUserRole() === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(...roles: UserRole[]): boolean {
  const userRole = getUserRole();
  return userRole !== null && roles.includes(userRole);
}

/**
 * Get user ID
 */
export function getUserId(): number | null {
  const user = getCurrentUser();
  return user?.id || null;
}

