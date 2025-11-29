import { IUserVolunteerClubMembership } from '../../../interfaces/membership/IUserVolunteerClubMembership';
import { MembershipStatus } from '../../../enums';

/**
 * DTO for membership response
 */
export class MembershipResponseDto implements IUserVolunteerClubMembership {
  id: number;
  userId: number;
  volunteerClubId: number;
  status: MembershipStatus;
  requestedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(membership: IUserVolunteerClubMembership) {
    this.id = membership.id!;
    this.userId = membership.userId;
    this.volunteerClubId = membership.volunteerClubId;
    this.status = membership.status;
    this.requestedAt = membership.requestedAt;
    this.reviewedAt = membership.reviewedAt;
    this.reviewedBy = membership.reviewedBy;
    this.notes = membership.notes;
    this.createdAt = membership.createdAt;
    this.updatedAt = membership.updatedAt;
  }
}

