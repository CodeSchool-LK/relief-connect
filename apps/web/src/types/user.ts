/**
 * User Types
 */

export type UserRole = 'ADMIN' | 'USER' | 'SYSTEM_ADMINISTRATOR' | 'VOLUNTEER_CLUB';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DISABLED';

export interface IUser {
  id: number;
  username: string;
  contactNumber?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateUser {
  username?: string;
  contactNumber?: string;
}

export interface IUpdateUserRole {
  role: UserRole;
}

export interface IUpdateUserStatus {
  status: UserStatus;
}

