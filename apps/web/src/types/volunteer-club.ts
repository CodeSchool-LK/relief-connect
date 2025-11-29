/**
 * Volunteer Club Types
 */

export interface IVolunteerClub {
  id: number;
  name: string;
  description?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  userId?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISABLED';
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateVolunteerClub {
  name: string;
  description?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  userId?: number;
}

export interface IUpdateVolunteerClub {
  name?: string;
  description?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  userId?: number;
}

