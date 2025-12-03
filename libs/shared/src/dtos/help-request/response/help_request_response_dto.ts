import { IHelpRequest } from '../../../interfaces/help-request/IHelpRequest';
import { HelpRequestStatus, Urgency, ContactType, Province, District } from '../../../enums';

/**
 * DTO for help request response
 */
export class HelpRequestResponseDto implements IHelpRequest {
  id: number;
  userId?: number;
  lat: number;
  lng: number;
  urgency: Urgency;
  shortNote: string;
  approxArea: string;
  contactType: ContactType;
  contact?: string;
  name?: string;
  totalPeople?: number;
  elders?: number;
  children?: number;
  pets?: number;
  rationItems?: string[];
  province?: Province;
  district?: District;
  status?: HelpRequestStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(helpRequest: IHelpRequest) {
    this.id = helpRequest.id!;
    this.userId = helpRequest.userId;
    this.lat = helpRequest.lat;
    this.lng = helpRequest.lng;
    this.urgency = helpRequest.urgency;
    this.shortNote = helpRequest.shortNote;
    this.approxArea = helpRequest.approxArea;
    this.contactType = helpRequest.contactType;
    this.contact = helpRequest.contact;
    this.name = helpRequest.name;
    this.totalPeople = helpRequest.totalPeople;
    this.elders = helpRequest.elders;
    this.children = helpRequest.children;
    this.pets = helpRequest.pets;
    this.rationItems = helpRequest.rationItems;
    this.province = helpRequest.province;
    this.district = helpRequest.district;
    this.status = helpRequest.status || HelpRequestStatus.OPEN;
    this.createdAt = helpRequest.createdAt;
    this.updatedAt = helpRequest.updatedAt;
  }
}

