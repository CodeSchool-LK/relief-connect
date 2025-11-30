import { IDonation } from '../../../interfaces/donation/IDonation';

/**
 * DTO for donation response
 */
export class DonationResponseDto implements IDonation {
  id: number;
  helpRequestId?: number;
  campId?: number;
  donatorId: number;
  donatorName: string;
  donatorMobileNumber: string;
  rationItems: Record<string, number>;
  donatorMarkedScheduled: boolean;
  donatorMarkedCompleted: boolean;
  ownerMarkedCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(donation: IDonation) {
    this.id = donation.id!;
    this.helpRequestId = donation.helpRequestId;
    this.campId = donation.campId;
    this.donatorId = donation.donatorId;
    this.donatorName = donation.donatorName;
    this.donatorMobileNumber = donation.donatorMobileNumber;
    this.rationItems = donation.rationItems;
    this.donatorMarkedScheduled = donation.donatorMarkedScheduled || false;
    this.donatorMarkedCompleted = donation.donatorMarkedCompleted || false;
    this.ownerMarkedCompleted = donation.ownerMarkedCompleted || false;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

