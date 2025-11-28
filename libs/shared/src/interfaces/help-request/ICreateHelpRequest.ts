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
}

