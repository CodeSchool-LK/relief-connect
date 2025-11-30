import { DonationDao, HelpRequestDao, HelpRequestInventoryItemDao, CampDao, CampInventoryItemDao, MembershipDao, VolunteerClubDao } from '../dao';
import { CreateDonationDto, DonationResponseDto, DonationWithHelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { CreateCampDonationDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/request/create_camp_donation_dto';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { MembershipStatus, UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Service layer for Donation business logic
 * Handles validation and business rules
 */
class DonationService {
  private static instance: DonationService;
  private donationDao: DonationDao;
  private helpRequestDao: HelpRequestDao;
  private inventoryItemDao: HelpRequestInventoryItemDao;
  private campDao: CampDao;
  private campInventoryItemDao: CampInventoryItemDao;
  private membershipDao: MembershipDao;
  private volunteerClubDao: VolunteerClubDao;
  private constructor(
    donationDao: DonationDao,
    helpRequestDao: HelpRequestDao,
    inventoryItemDao: HelpRequestInventoryItemDao,
    campDao: CampDao,
    campInventoryItemDao: CampInventoryItemDao,
    membershipDao: MembershipDao,
    volunteerClubDao: VolunteerClubDao
  ) {
    this.donationDao = donationDao;
    this.helpRequestDao = helpRequestDao;
    this.inventoryItemDao = inventoryItemDao;
    this.campDao = campDao;
    this.campInventoryItemDao = campInventoryItemDao;
    this.membershipDao = membershipDao;
    this.volunteerClubDao = volunteerClubDao;
  }

  /**
   * Get DonationService singleton instance
   */
  public static getInstance(): DonationService {
    if (!DonationService.instance) {
      DonationService.instance = new DonationService(
        DonationDao.getInstance(),
        HelpRequestDao.getInstance(),
        HelpRequestInventoryItemDao.getInstance(),
        CampDao.getInstance(),
        CampInventoryItemDao.getInstance(),
        MembershipDao.getInstance(),
        VolunteerClubDao.getInstance()
      );
    }
    return DonationService.instance;
  }

  /**
   * Get all donations made by the authenticated user
   * @param donatorId - User ID of the donator
   */
  public async getMyDonations(donatorId: number): Promise<IApiResponse<DonationWithHelpRequestResponseDto[]>> {
    try {
      const donations = await this.donationDao.findByDonatorId(donatorId);
      
      // Map donations to DTOs with help request and camp information
      const donationDtos = donations.map(d => {
        return new DonationWithHelpRequestResponseDto(d, d.helpRequest, d.camp);
      });

      return {
        success: true,
        data: donationDtos,
        count: donationDtos.length,
      };
    } catch (error) {
      console.error(`Error in DonationService.getMyDonations (${donatorId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve donations',
      };
    }
  }

  /**
   * Get all donations for a help request
   * @param helpRequestId - The help request ID
   * @param requesterUserId - Optional user ID of the requester (to check if they're the owner or donator)
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
      const donationDtos = donations.map(d => {
        // Show contact info if requester is owner OR if requester is the donator
        const isDonator = requesterUserId !== undefined && d.donatorId === requesterUserId;
        const showContactInfo = isOwner || isDonator;
        return new DonationWithDonatorResponseDto(d, showContactInfo);
      });

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
        createDonationDto.donatorName,
        createDonationDto.donatorMobileNumber,
        createDonationDto.rationItems,
        undefined
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
        if (updatedDonation.helpRequestId) {
          await this.inventoryItemDao.confirmPendingQuantities(
            updatedDonation.helpRequestId,
            updatedDonation.rationItems
          );
        } else if (updatedDonation.campId) {
          await this.campInventoryItemDao.confirmPendingQuantities(
            updatedDonation.campId,
            updatedDonation.rationItems
          );
        }
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

      // Verify this is a help request donation (not a camp donation)
      if (!donation.helpRequestId) {
        return {
          success: false,
          error: 'This donation is not associated with a help request. Use the camp donation completion endpoint instead.',
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
        if (updatedDonation.helpRequestId) {
          await this.inventoryItemDao.confirmPendingQuantities(
            updatedDonation.helpRequestId,
            updatedDonation.rationItems
          );
        } else if (updatedDonation.campId) {
          await this.campInventoryItemDao.confirmPendingQuantities(
            updatedDonation.campId,
            updatedDonation.rationItems
          );
        }
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

  /**
   * Get all donations for a camp
   * @param campId - The camp ID
   * @param requesterUserId - Optional user ID of the requester (to check permissions)
   * @param requesterUserRole - Optional user role of the requester (to check permissions)
   */
  public async getDonationsByCampId(
    campId: number,
    requesterUserId?: number,
    requesterUserRole?: UserRole
  ): Promise<IApiResponse<DonationWithDonatorResponseDto[]>> {
    try {
      // Verify camp exists
      const camp = await this.campDao.findById(campId);
      if (!camp) {
        return {
          success: false,
          error: 'Camp not found',
        };
      }

      // Check if requester is club admin, system admin, or member
      const isSystemAdmin = requesterUserRole === UserRole.SYSTEM_ADMINISTRATOR || requesterUserRole === UserRole.ADMIN;
      const isClubAdmin = requesterUserId !== undefined && camp.volunteerClubId && 
        await this.isClubAdmin(camp.volunteerClubId, requesterUserId);

      const donations = await this.donationDao.findByCampId(campId);
      const donationDtos = donations.map(d => {
        // Show contact info if requester is club admin, system admin, OR if requester is the donator
        // Club admins should ALWAYS see contact info for their camp's donations
        const isDonator = requesterUserId !== undefined && d.donatorId === requesterUserId;
        const showContactInfo = isSystemAdmin || isClubAdmin || isDonator;
        return new DonationWithDonatorResponseDto(d, showContactInfo);
      });

      return {
        success: true,
        data: donationDtos,
        count: donationDtos.length,
      };
    } catch (error) {
      console.error(`Error in DonationService.getDonationsByCampId (${campId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve donations',
      };
    }
  }

  /**
   * Create a new camp donation
   * @param createCampDonationDto - Camp donation data
   * @param donatorId - User ID of the donator
   * @param donatorRole - Optional user role of the donator (for admin auto-approval)
   * @param autoApprove - Optional flag to auto-approve donation (for admins)
   */
  public async createCampDonation(
    createCampDonationDto: CreateCampDonationDto, 
    donatorId: number,
    donatorRole?: UserRole,
    autoApprove?: boolean
  ): Promise<IApiResponse<DonationResponseDto>> {
    try {
      // Verify camp exists
      const camp = await this.campDao.findById(createCampDonationDto.campId);
      if (!camp) {
        return {
          success: false,
          error: 'Camp not found',
        };
      }

      // Validate ration items
      if (!createCampDonationDto.rationItems || Object.keys(createCampDonationDto.rationItems).length === 0) {
        return {
          success: false,
          error: 'At least one ration item with count is required',
        };
      }

      // Validate counts are positive numbers
      for (const [itemId, count] of Object.entries(createCampDonationDto.rationItems)) {
        if (typeof count !== 'number' || count <= 0) {
          return {
            success: false,
            error: `Invalid count for ration item ${itemId}. Count must be a positive number`,
          };
        }
      }

      const donation = await this.donationDao.create(
        undefined, // helpRequestId
        donatorId,
        createCampDonationDto.donatorName,
        createCampDonationDto.donatorMobileNumber,
        createCampDonationDto.rationItems,
        createCampDonationDto.campId // campId
      );

      // Check if this is an admin donation that should be auto-approved
      const isSystemAdmin = donatorRole === UserRole.SYSTEM_ADMINISTRATOR || donatorRole === UserRole.ADMIN;
      const isClubAdmin = camp.volunteerClubId && await this.isClubAdmin(camp.volunteerClubId, donatorId);
      const shouldAutoApprove = autoApprove && (isSystemAdmin || isClubAdmin);

      // Add pending quantities first (for tracking)
      await this.campInventoryItemDao.addPendingQuantities(
        createCampDonationDto.campId,
        createCampDonationDto.rationItems
      );

      if (shouldAutoApprove) {
        // Auto-approve: Mark donation as completed by both donator and owner
        await this.donationDao.markAsCompletedByDonator(donation.id!);
        await this.donationDao.markAsCompletedByOwner(donation.id!);

        // Move from pending to donated quantities
        await this.campInventoryItemDao.confirmPendingQuantities(
          createCampDonationDto.campId,
          createCampDonationDto.rationItems
        );

        // Reload donation to get updated status
        const updatedDonation = await this.donationDao.findById(donation.id!);
        return {
          success: true,
          data: new DonationResponseDto(updatedDonation!),
          message: 'Camp donation created and approved successfully. Items have been added to camp inventory.',
        };
      } else {
        // Normal flow: Items remain in pending until admin approval
        return {
          success: true,
          data: new DonationResponseDto(donation),
          message: 'Camp donation created successfully',
        };
      }
    } catch (error) {
      console.error('Error in DonationService.createCampDonation:', error);
      return {
        success: false,
        error: 'Failed to create camp donation',
      };
    }
  }

  /**
   * Accept a camp donation (club admin only)
   * @param donationId - The donation ID
   * @param campId - The camp ID
   * @param clubAdminId - User ID of the club admin
   */
  public async acceptCampDonation(donationId: number, campId: number, clubAdminId: number): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const donation = await this.donationDao.findById(donationId);
      if (!donation) {
        return {
          success: false,
          error: 'Donation not found',
        };
      }

      // Verify donation belongs to this camp
      if (donation.campId !== campId) {
        return {
          success: false,
          error: 'Donation does not belong to this camp',
        };
      }

      // Verify camp exists and user is club admin
      const camp = await this.campDao.findById(campId);
      if (!camp) {
        return {
          success: false,
          error: 'Camp not found',
        };
      }

      if (!camp.volunteerClubId) {
        return {
          success: false,
          error: 'Camp does not belong to a volunteer club',
        };
      }

      const isClubAdmin = await this.isClubAdmin(camp.volunteerClubId, clubAdminId);
      if (!isClubAdmin) {
        return {
          success: false,
          error: 'Only club admins can accept donations',
        };
      }

      // Check if donator is already a member of the club
      const existingMembership = await this.membershipDao.findByUserAndClub(
        donation.donatorId,
        camp.volunteerClubId
      );

      // If not a member, auto-register them as an approved member
      if (!existingMembership || existingMembership.status !== MembershipStatus.APPROVED) {
        if (existingMembership) {
          // If membership exists but not approved, update it to approved
          await this.membershipDao.updateStatus(
            existingMembership.id!,
            MembershipStatus.APPROVED,
            clubAdminId,
            'Auto-approved upon donation acceptance'
          );
        } else {
          // Create new approved membership
          const newMembership = await this.membershipDao.create(
            donation.donatorId,
            camp.volunteerClubId
          );
          // Immediately approve it
          await this.membershipDao.updateStatus(
            newMembership.id!,
            MembershipStatus.APPROVED,
            clubAdminId,
            'Auto-approved upon donation acceptance'
          );
        }
      }

      // Mark donation as completed by owner (club admin)
      const updatedDonation = await this.donationDao.markAsCompletedByOwner(donationId);
      if (!updatedDonation) {
        return {
          success: false,
          error: 'Failed to update donation',
        };
      }

      // Move pending quantities to donated in camp inventory
      await this.campInventoryItemDao.confirmPendingQuantities(
        campId,
        donation.rationItems
      );

      return {
        success: true,
        data: new DonationResponseDto(updatedDonation),
        message: 'Camp donation accepted successfully. Donator has been automatically registered as a club member.',
      };
    } catch (error) {
      console.error(`Error in DonationService.acceptCampDonation (${donationId}):`, error);
      return {
        success: false,
        error: 'Failed to accept camp donation',
      };
    }
  }

  /**
   * Helper method to check if user is club admin
   */
  private async isClubAdmin(volunteerClubId: number, userId: number): Promise<boolean> {
    try {
      const club = await this.volunteerClubDao.findByUserId(userId);
      return club !== null && club.id === volunteerClubId;
    } catch (error) {
      console.error(`Error in DonationService.isClubAdmin (${volunteerClubId}, ${userId}):`, error);
      return false;
    }
  }
}

export default DonationService;

