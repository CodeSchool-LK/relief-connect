/**
 * Membership Types
 */

export type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IMembership {
  id: number;
  userId: number;
  volunteerClubId: number;
  status: MembershipStatus;
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRequestMembership {
  volunteerClubId: number;
}

export interface IReviewMembership {
  status: MembershipStatus;
  notes?: string;
}

export interface IMembershipWithClub extends IMembership {
  volunteerClub?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface IMembershipWithUser extends IMembership {
  user?: {
    id: number;
    username: string;
  };
}

