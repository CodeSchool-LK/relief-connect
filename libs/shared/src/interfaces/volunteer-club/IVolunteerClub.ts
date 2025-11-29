import { UserStatus } from '../../enums';

/**
 * Volunteer Club interface
 */
export interface IVolunteerClub {
  id?: number;
  name: string;
  description?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  userId?: number; // User who owns/manages this club
  status: UserStatus; // ACTIVE, INACTIVE, DISABLED
  createdAt?: Date;
  updatedAt?: Date;
}

