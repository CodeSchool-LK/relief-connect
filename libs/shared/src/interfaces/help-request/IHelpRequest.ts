import { Urgency, ContactType, HelpRequestStatus, Province, District } from '../../enums';

/**
 * Help Request interface
 */
export interface IHelpRequest {
  id?: number;
  userId?: number; // User who created this help request
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
  // Ration items
  rationItems?: string[]; // Array of selected ration item IDs (e.g., ['dry_rations', 'bottled_water'])
  // Location details
  province?: Province; // Sri Lanka province enum (optional in backend)
  district?: District; // Sri Lanka district enum (optional in backend)
  status?: HelpRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

