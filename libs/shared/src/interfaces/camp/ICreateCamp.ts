import { CampType, PeopleRange, CampNeed, ContactType, RationItemType } from '../../enums';
import { ICampDropOffLocation, ICampItem } from './ICampDropOffLocation';

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
  peopleCount?: number; // Exact count of people being helped
  needs: CampNeed[];
  shortNote: string;
  description?: string; // Optional longer description
  location?: string; // Address or location description
  contactType: ContactType;
  contact?: string;
  // Items needed for the camp
  items?: Array<{
    itemType: RationItemType;
    quantity: number;
    notes?: string;
  }>;
  // Drop-off locations where goods are accepted
  dropOffLocations?: Array<{
    name: string;
    address?: string;
    lat?: string | number; // Accept string to preserve floating point precision
    lng?: string | number; // Accept string to preserve floating point precision
    contactNumber?: string;
    notes?: string;
  }>;
  // Help request IDs to connect people who need help
  helpRequestIds?: number[];
  // Donation IDs to connect people who are helping
  donationIds?: number[];
}

