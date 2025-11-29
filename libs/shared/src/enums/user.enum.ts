/**
 * Enums for User domain
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER', // Using USER instead of CURRENT as it's more standard
  SYSTEM_ADMINISTRATOR = 'SYSTEM_ADMINISTRATOR',
  VOLUNTEER_CLUB = 'VOLUNTEER_CLUB',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISABLED = 'DISABLED',
}

