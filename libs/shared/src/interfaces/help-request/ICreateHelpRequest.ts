import { Urgency, ContactType } from '../../enums';

/**
 * Frontend interface for creating a new help request
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface ICreateHelpRequest {
  lat: number;
  lng: number;
  urgency: Urgency;
  shortNote: string;
  approxArea: string;
  contactType: ContactType;
  contact?: string;
  // Team/People data
  name?: string; // Name of the requester
  totalPeople?: number; // Total number of people
  elders?: number; // Number of elders/adults
  children?: number; // Number of children
  pets?: number; // Number of pets
  // Ration items with quantities
  rationItems?: Record<string, number>; // Map of item codes to quantities (e.g., { 'dry_rations': 5, 'bottled_water': 10 })
}

