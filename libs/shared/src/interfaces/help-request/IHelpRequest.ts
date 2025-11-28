import { HelpRequestCategory, Urgency, ContactType, HelpRequestStatus } from '../../enums';

/**
 * Help Request interface
 */
export interface IHelpRequest {
  id?: number;
  lat: number;
  lng: number;
  category: HelpRequestCategory;
  urgency: Urgency;
  shortNote: string;
  approxArea: string;
  contactType: ContactType;
  contact?: string;
  status?: HelpRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

