import { IHelpRequest } from '../../../interfaces/help-request/IHelpRequest';
import { HelpRequestStatus, Urgency, ContactType } from '../../../enums';
import { InventoryItemResponseDto } from '../../inventory/response/inventory_item_response_dto';

/**
 * Extended DTO for help request response that includes ownership information
 * isOwner is determined by the backend based on the authenticated user
 */
export class HelpRequestWithOwnershipResponseDto {
  id: number;
  userId?: number;
  isOwner: boolean; // Determined by backend - true if authenticated user is the owner
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
  status?: HelpRequestStatus;
  inventory?: InventoryItemResponseDto[]; // Inventory items for this help request
  createdAt?: Date;
  updatedAt?: Date;

  constructor(helpRequest: IHelpRequest, isOwner: boolean = false, inventory?: InventoryItemResponseDto[]) {
    this.id = helpRequest.id!;
    this.userId = helpRequest.userId;
    this.isOwner = isOwner;
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
    this.status = helpRequest.status || HelpRequestStatus.OPEN;
    this.inventory = inventory;
    this.createdAt = helpRequest.createdAt;
    this.updatedAt = helpRequest.updatedAt;
  }
}

