import { IDonation } from '../../../interfaces/donation/IDonation';
import { IHelpRequest } from '../../../interfaces/help-request/IHelpRequest';

/**
 * Extended DTO for donation response that includes help request information
 * Used for "my donations" endpoint where user wants to see what help requests they've donated to
 */
export class DonationWithHelpRequestResponseDto {
  id: number;
  helpRequestId: number;
  donatorId: number;
  rationItems: Record<string, number>;
  donatorMarkedScheduled: boolean;
  donatorMarkedCompleted: boolean;
  ownerMarkedCompleted: boolean;
  helpRequest?: IHelpRequest; // Full help request details
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    donation: IDonation,
    helpRequest?: IHelpRequest
  ) {
    this.id = donation.id!;
    this.helpRequestId = donation.helpRequestId;
    this.donatorId = donation.donatorId;
    this.rationItems = donation.rationItems;
    this.donatorMarkedScheduled = donation.donatorMarkedScheduled || false;
    this.donatorMarkedCompleted = donation.donatorMarkedCompleted || false;
    this.ownerMarkedCompleted = donation.ownerMarkedCompleted || false;
    this.helpRequest = helpRequest;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

