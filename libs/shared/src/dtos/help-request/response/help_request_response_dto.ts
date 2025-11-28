import { IHelpRequest } from '../../../interfaces/help-request/IHelpRequest';
import { HelpRequestStatus, HelpRequestCategory, Urgency, ContactType } from '../../../enums';

/**
 * DTO for help request response
 */
export class HelpRequestResponseDto implements IHelpRequest {
  id: number;
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

  constructor(helpRequest: IHelpRequest) {
    this.id = helpRequest.id!;
    this.lat = helpRequest.lat;
    this.lng = helpRequest.lng;
    this.category = helpRequest.category;
    this.urgency = helpRequest.urgency;
    this.shortNote = helpRequest.shortNote;
    this.approxArea = helpRequest.approxArea;
    this.contactType = helpRequest.contactType;
    this.contact = helpRequest.contact;
    this.status = helpRequest.status || HelpRequestStatus.OPEN;
    this.createdAt = helpRequest.createdAt;
    this.updatedAt = helpRequest.updatedAt;
  }
}

