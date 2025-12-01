import { IDonation } from '../../../interfaces/donation/IDonation';

/**
 * Extended DTO for donation response that includes donator information
 * Contact info (name and mobile) is only included if:
 * - The requester is the help request owner, OR
 * - The requester is the donator themselves
 */
export class DonationWithDonatorResponseDto {
  id: number;
  helpRequestId?: number;
  campId?: number;
  donatorId: number;
  donatorUsername?: string;
  donatorName: string; // Always included - stored directly in donation
  donatorMobileNumber?: string; // Only included if requester is owner or donator
  rationItems: Record<string, number>;
  donatorMarkedScheduled: boolean;
  donatorMarkedCompleted: boolean;
  ownerMarkedCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    donation: IDonation & { donator?: { id: number; username: string; contactNumber?: string } },
    showContactInfo: boolean = false
  ) {
    this.id = donation.id!;
    this.helpRequestId = donation.helpRequestId;
    this.campId = donation.campId;
    this.donatorId = donation.donatorId;
    this.donatorName = donation.donatorName; // Always include name
    //this.donatorUsername = donation.donator?.username; // Include username as fallback
    // Show mobile number if requester is owner or donator
    // For camp donations, the mobile number is stored directly in the donation record, so always include it
    if (showContactInfo || donation.campId) {
      this.donatorMobileNumber = donation.donatorMobileNumber;
    }
    this.rationItems = donation.rationItems;
    this.donatorMarkedScheduled = donation.donatorMarkedScheduled || false;
    this.donatorMarkedCompleted = donation.donatorMarkedCompleted || false;
    this.ownerMarkedCompleted = donation.ownerMarkedCompleted || false;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

