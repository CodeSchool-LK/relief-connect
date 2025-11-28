import { CampType, PeopleRange, CampNeed, ContactType } from '../../enums';

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
  needs: CampNeed[];
  shortNote: string;
  contactType: ContactType;
  contact?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

