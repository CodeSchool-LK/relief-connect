import { IVolunteerClub } from '../../../interfaces/volunteer-club/IVolunteerClub';
import { UserStatus } from '../../../enums';

/**
 * DTO for volunteer club response
 */
export class VolunteerClubResponseDto implements IVolunteerClub {
  id: number;
  name: string;
  description?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  userId?: number;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(volunteerClub: IVolunteerClub) {
    this.id = volunteerClub.id!;
    this.name = volunteerClub.name;
    this.description = volunteerClub.description;
    this.contactNumber = volunteerClub.contactNumber;
    this.email = volunteerClub.email;
    this.address = volunteerClub.address;
    this.userId = volunteerClub.userId;
    this.status = volunteerClub.status;
    this.createdAt = volunteerClub.createdAt;
    this.updatedAt = volunteerClub.updatedAt;
  }
}

