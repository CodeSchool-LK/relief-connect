/**
 * Donation interface
 * Represents a donation made by a donator to a help request or camp
 */
export interface IDonation {
  id?: number;
  helpRequestId?: number; // The help request this donation is for (optional if campId is provided)
  campId?: number; // The camp this donation is for (optional if helpRequestId is provided)
  donatorId: number; // The user (donator) making the donation
  donatorName: string; // Donator's name for contacting
  donatorMobileNumber: string; // Donator's mobile number for contacting
  rationItems: Record<string, number>; // Map of ration item IDs to counts (e.g., { 'dry_rations': 5, 'bottled_water': 10 })
  donatorMarkedScheduled?: boolean; // Whether donator marked as scheduled
  donatorMarkedCompleted?: boolean; // Whether donator marked as completed
  ownerMarkedCompleted?: boolean; // Whether help request owner or club admin marked as completed
  createdAt?: Date;
  updatedAt?: Date;
}

