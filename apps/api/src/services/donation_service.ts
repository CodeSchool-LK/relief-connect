import { DonationDao, HelpRequestDao, HelpRequestInventoryItemDao } from '../dao';
import { CreateDonationDto, DonationResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Service layer for Donation business logic
 * Handles validation and business rules
 */
class DonationService {
  private static instance: DonationService;
  private donationDao: DonationDao;
  private helpRequestDao: HelpRequestDao;
  private inventoryItemDao: HelpRequestInventoryItemDao;

  private constructor(
    donationDao: DonationDao,
    helpRequestDao: HelpRequestDao,
    inventoryItemDao: HelpRequestInventoryItemDao
  ) {
    this.donationDao = donationDao;
    this.helpRequestDao = helpRequestDao;
    this.inventoryItemDao = inventoryItemDao;
  }

  /**
   * Get DonationService singleton instance
   */
  public static getInstance(): DonationService {
    if (!DonationService.instance) {
      DonationService.instance = new DonationService(
        DonationDao.getInstance(),
        HelpRequestDao.getInstance(),
        HelpRequestInventoryItemDao.getInstance()
      );
    }
    return DonationService.instance;
  }

  /**
   * Get all donations for a help request
   * @param helpRequestId - The help request ID
   * @param requesterUserId - Optional user ID of the requester (to check if they're the owner)
   */
  public async getDonationsByHelpRequestId(
    helpRequestId: number,
    requesterUserId?: number
  ): Promise<IApiResponse<DonationWithDonatorResponseDto[]>> {
    try {
      // Verify help request exists
      const helpRequest = await this.helpRequestDao.findById(helpRequestId);
      if (!helpRequest) {
        return {
          success: false,
          error: 'Help request not found',
        };
      }

      // Check if requester is the owner
      const isOwner = requesterUserId !== undefined && helpRequest.userId === requesterUserId;

      const donations = await this.donationDao.findByHelpRequestId(helpRequestId);
      const donationDtos = donations.map(d => new DonationWithDonatorResponseDto(d, isOwner));

      return {
        success: true,
        data: donationDtos,
        count: donationDtos.length,
      };
    } catch (error) {
      console.error(`Error in DonationService.getDonationsByHelpRequestId (${helpRequestId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve donations',
      };
    }
  }

  /**
   * Create a new donation
   * @param createDonationDto - Donation data
   * @param donatorId - User ID of the donator
   */
  public async createDonation(createDonationDto: CreateDonationDto, donatorId: number): Promise<IApiResponse<DonationResponseDto>> {
    try {
      // Verify help request exists
      const helpRequest = await this.helpRequestDao.findById(createDonationDto.helpRequestId);
      if (!helpRequest) {
        return {
          success: false,
          error: 'Help request not found',
        };
      }

      // Validate ration items
      if (!createDonationDto.rationItems || Object.keys(createDonationDto.rationItems).length === 0) {
        return {
          success: false,
          error: 'At least one ration item with count is required',
        };
      }

      // Validate counts are positive numbers
      for (const [itemId, count] of Object.entries(createDonationDto.rationItems)) {
        if (typeof count !== 'number' || count <= 0) {
          return {
            success: false,
            error: `Invalid count for ration item ${itemId}. Count must be a positive number`,
          };
        }
      }

      const donation = await this.donationDao.create(
        createDonationDto.helpRequestId,
        donatorId,
        createDonationDto.rationItems
      );

      // Add pending quantities to inventory
      await this.inventoryItemDao.addPendingQuantities(
        createDonationDto.helpRequestId,
        createDonationDto.rationItems
      );

      return {
        success: true,
        data: new DonationResponseDto(donation),
        message: 'Donation created successfully',
      };
    } catch (error) {
      console.error('Error in DonationService.createDonation:', error);
      return {
        success: false,
        error: 'Failed to create donation',
      };
    }
  }

  /**
   * Mark donation as scheduled by donator
   */
  public async markAsScheduled(donationId: number, donatorId: number): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const donation = await this.donationDao.findById(donationId);
      if (!donation) {
        return {
          success: false,
          error: 'Donation not found',
        };
      }

      // Verify the donator owns this donation
      if (donation.donatorId !== donatorId) {
        return {
          success: false,
          error: 'You can only mark your own donations as scheduled',
        };
      }

      const updatedDonation = await this.donationDao.markAsScheduled(donationId);
      if (!updatedDonation) {
        return {
          success: false,
          error: 'Failed to update donation',
        };
      }

      return {
        success: true,
        data: new DonationResponseDto(updatedDonation),
        message: 'Donation marked as scheduled',
      };
    } catch (error) {
      console.error(`Error in DonationService.markAsScheduled (${donationId}):`, error);
      return {
        success: false,
        error: 'Failed to mark donation as scheduled',
      };
    }
  }

  /**
   * Mark donation as completed by donator
   */
  public async markAsCompletedByDonator(donationId: number, donatorId: number): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const donation = await this.donationDao.findById(donationId);
      if (!donation) {
        return {
          success: false,
          error: 'Donation not found',
        };
      }

      // Verify the donator owns this donation
      if (donation.donatorId !== donatorId) {
        return {
          success: false,
          error: 'You can only mark your own donations as completed',
        };
      }

      const updatedDonation = await this.donationDao.markAsCompletedByDonator(donationId);
      if (!updatedDonation) {
        return {
          success: false,
          error: 'Failed to update donation',
        };
      }

      // If both donator and receiver have confirmed, move pending to donated
      if (updatedDonation.donatorMarkedCompleted && updatedDonation.ownerMarkedCompleted) {
        await this.inventoryItemDao.confirmPendingQuantities(
          updatedDonation.helpRequestId,
          updatedDonation.rationItems
        );
      }

      return {
        success: true,
        data: new DonationResponseDto(updatedDonation),
        message: 'Donation marked as completed',
      };
    } catch (error) {
      console.error(`Error in DonationService.markAsCompletedByDonator (${donationId}):`, error);
      return {
        success: false,
        error: 'Failed to mark donation as completed',
      };
    }
  }

  /**
   * Mark donation as completed by help request owner
   */
  public async markAsCompletedByOwner(donationId: number, ownerId: number): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const donation = await this.donationDao.findById(donationId);
      if (!donation) {
        return {
          success: false,
          error: 'Donation not found',
        };
      }

      // Verify the owner owns the help request
      const helpRequest = await this.helpRequestDao.findById(donation.helpRequestId);
      if (!helpRequest) {
        return {
          success: false,
          error: 'Help request not found',
        };
      }

      if (helpRequest.userId !== ownerId) {
        return {
          success: false,
          error: 'You can only mark donations for your own help requests as completed',
        };
      }

      const updatedDonation = await this.donationDao.markAsCompletedByOwner(donationId);
      if (!updatedDonation) {
        return {
          success: false,
          error: 'Failed to update donation',
        };
      }

      // If both donator and receiver have confirmed, move pending to donated
      if (updatedDonation.donatorMarkedCompleted && updatedDonation.ownerMarkedCompleted) {
        await this.inventoryItemDao.confirmPendingQuantities(
          updatedDonation.helpRequestId,
          updatedDonation.rationItems
        );
      }

      return {
        success: true,
        data: new DonationResponseDto(updatedDonation),
        message: 'Donation marked as completed',
      };
    } catch (error) {
      console.error(`Error in DonationService.markAsCompletedByOwner (${donationId}):`, error);
      return {
        success: false,
        error: 'Failed to mark donation as completed',
      };
    }
  }
}

export default DonationService;

