import { HelpRequestCategory, Urgency, ContactType } from '../../enums';

/**
 * Frontend interface for creating a new help request
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface ICreateHelpRequest {
  lat: number;
  lng: number;
  category: HelpRequestCategory;
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
  // Ration items
  rationItems?: string[]; // Array of selected ration item IDs (e.g., ['dry_rations', 'bottled_water'])
}

