import { UserRole, UserStatus, Permission } from '../../enums';

/**
 * User interface
 */
export interface IUser {
  id?: number;
  username: string;
  password?: string; // Optional, can be null if user hasn't set a password
  contactNumber?: string; // Contact number for verification and communication (only shown to help request owners)
  role: UserRole;
  status: UserStatus;
  permissions?: Permission[]; // Array of permissions (only for SYSTEM_ADMINISTRATOR role)
  createdAt?: Date;
  updatedAt?: Date;
}

