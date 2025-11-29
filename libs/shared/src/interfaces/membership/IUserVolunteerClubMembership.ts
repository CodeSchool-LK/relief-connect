import { MembershipStatus } from '../../enums';

/**
 * User Volunteer Club Membership interface
 */
export interface IUserVolunteerClubMembership {
  id?: number;
  userId: number;
  volunteerClubId: number;
  status: MembershipStatus; // PENDING, APPROVED, REJECTED
  requestedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: number; // User ID who reviewed
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

