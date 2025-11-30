import { IDonation } from '../../../interfaces/donation/IDonation';
import { IHelpRequest } from '../../../interfaces/help-request/IHelpRequest';
import { ICamp } from '../../../interfaces/camp/ICamp';

/**
 * Extended DTO for donation response that includes help request and camp information
 * Used for "my donations" endpoint where user wants to see what help requests or camps they've donated to
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
  camp?: ICamp; // Full camp details
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    donation: IDonation,
    helpRequest?: IHelpRequest,
    camp?: ICamp
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
    this.camp = camp;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

