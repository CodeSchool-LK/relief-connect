import { IDonation } from '../../../interfaces/donation/IDonation';
import { IHelpRequest } from '../../../interfaces/help-request/IHelpRequest';

/**
 * Extended DTO for donation response that includes help request information
 * Used for "my donations" endpoint where user wants to see what help requests they've donated to
 * Contact info is always shown since user is viewing their own donations
 */
export class DonationWithHelpRequestResponseDto {
  id: number;
  helpRequestId?: number;
  campId?: number;
  donatorId: number;
  donatorName: string; // Always shown since user is viewing their own donations
  donatorMobileNumber: string; // Always shown since user is viewing their own donations
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
    this.campId = donation.campId;
    this.donatorId = donation.donatorId;
    this.donatorName = donation.donatorName; // Always show since user is viewing their own donations
    this.donatorMobileNumber = donation.donatorMobileNumber; // Always show since user is viewing their own donations
    this.rationItems = donation.rationItems;
    this.donatorMarkedScheduled = donation.donatorMarkedScheduled || false;
    this.donatorMarkedCompleted = donation.donatorMarkedCompleted || false;
    this.ownerMarkedCompleted = donation.ownerMarkedCompleted || false;
    this.helpRequest = helpRequest;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

