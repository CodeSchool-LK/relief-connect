import { CampType, PeopleRange, CampNeed, ContactType } from '../../enums';

/**
 * Frontend interface for creating a new camp
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface ICreateCamp {
  lat: number;
  lng: number;
  campType: CampType;
  name: string;
  peopleRange: PeopleRange;
  needs: CampNeed[];
  shortNote: string;
  contactType: ContactType;
  contact?: string;
}

