import { CampType, PeopleRange, CampNeed, ContactType, CampStatus } from '../../enums';

/**
 * Camp interface
 */
export interface ICamp {
  id?: number;
  lat: number;
  lng: number;
  campType: CampType;
  name: string;
  peopleRange: PeopleRange;
  peopleCount?: number; // Exact count of people being helped
  needs: CampNeed[];
  shortNote: string;
  description?: string; // Optional longer description
  location?: string; // Address or location description
  contactType: ContactType;
  contact?: string;
  volunteerClubId?: number; // Foreign key to volunteer club
  status?: CampStatus; // Camp status (ACTIVE, INACTIVE, COMPLETED)
  createdAt?: Date;
  updatedAt?: Date;
}

