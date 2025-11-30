import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ICreateDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/ICreateDonation';
import { ICreateCampDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/ICreateCampDonation';
import { DonationWithDonatorResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_donator_response_dto';
import { DonationResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_response_dto';
import { DonationWithHelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/response/donation_with_help_request_response_dto';

/**
 * Donation Service
 * Handles all donation-related API calls
 */
class DonationService {
  private static instance: DonationService;
  private readonly basePath = '/api/help-requests';

  private constructor() {}

  /**
   * Get DonationService singleton instance
   */
  public static getInstance(): DonationService {
    if (!DonationService.instance) {
      DonationService.instance = new DonationService();
    }
    return DonationService.instance;
  }

  /**
   * Get all donations for a help request
   */
  public async getDonationsByHelpRequestId(
    helpRequestId: number
  ): Promise<IApiResponse<DonationWithDonatorResponseDto[]>> {
    try {
      const response = await apiClient.get<IApiResponse<DonationWithDonatorResponseDto[]>>(
        `${this.basePath}/${helpRequestId}/donations`
      );
      return response;
    } catch (error) {
      console.error(`Error in DonationService.getDonationsByHelpRequestId (${helpRequestId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch donations',
      };
    }
  }

  /**
   * Create a new donation
   */
  public async createDonation(
    helpRequestId: number,
    createDonationDto: ICreateDonation
  ): Promise<IApiResponse<DonationResponseDto>> {
    try {
      console.log('[DonationService] Creating donation:', createDonationDto);
      
      const response = await apiClient.post<IApiResponse<DonationResponseDto>>(
        `${this.basePath}/${helpRequestId}/donations`,
        createDonationDto
      );
      
      console.log('[DonationService] Donation created successfully:', response);
      return response;
    } catch (error) {
      console.error('[DonationService] Error creating donation:', error);

      if (error instanceof Error) {
        const anyErr = error as Error & { details?: unknown };
        let message = error.message || 'Failed to create donation';

        if (anyErr.details && Array.isArray(anyErr.details)) {
          const first = anyErr.details[0] as {
            field?: string;
            constraints?: Record<string, string>;
          };
          const constraintMessages = first?.constraints ? Object.values(first.constraints) : [];
          if (constraintMessages.length > 0) {
            message = constraintMessages[0];
          }
        }

        return {
          success: false,
          error: message,
        };
      }

      return {
        success: false,
        error: 'Failed to create donation',
      };
    }
  }

  /**
   * Mark donation as scheduled by donator
   */
  public async markAsScheduled(
    helpRequestId: number,
    donationId: number
  ): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const response = await apiClient.patch<IApiResponse<DonationResponseDto>>(
        `${this.basePath}/${helpRequestId}/donations/${donationId}/schedule`,
        {}
      );
      return response;
    } catch (error) {
      console.error(`Error in DonationService.markAsScheduled (${donationId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark donation as scheduled',
      };
    }
  }

  /**
   * Mark donation as completed by donator
   */
  public async markAsCompletedByDonator(
    helpRequestId: number,
    donationId: number
  ): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const response = await apiClient.patch<IApiResponse<DonationResponseDto>>(
        `${this.basePath}/${helpRequestId}/donations/${donationId}/complete-donator`,
        {}
      );
      return response;
    } catch (error) {
      console.error(`Error in DonationService.markAsCompletedByDonator (${donationId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark donation as completed',
      };
    }
  }

  /**
   * Mark donation as completed by owner
   */
  public async markAsCompletedByOwner(
    helpRequestId: number,
    donationId: number
  ): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const response = await apiClient.patch<IApiResponse<DonationResponseDto>>(
        `${this.basePath}/${helpRequestId}/donations/${donationId}/complete-owner`,
        {}
      );
      return response;
    } catch (error) {
      console.error(`Error in DonationService.markAsCompletedByOwner (${donationId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark donation as completed',
      };
    }
  }

  /**
   * Get authenticated user's donations
   */
  public async getMyDonations(): Promise<IApiResponse<DonationWithHelpRequestResponseDto[]>> {
    try {
      const response = await apiClient.get<IApiResponse<DonationWithHelpRequestResponseDto[]>>(
        `${this.basePath}/my/donations`
      );
      return response;
    } catch (error) {
      console.error('Error in DonationService.getMyDonations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch my donations',
      };
    }
  }

  /**
   * Get all donations for a camp
   */
  public async getDonationsByCampId(campId: number): Promise<IApiResponse<DonationWithDonatorResponseDto[]>> {
    try {
      const response = await apiClient.get<IApiResponse<DonationWithDonatorResponseDto[]>>(
        `/api/camps/${campId}/donations`
      );
      return response;
    } catch (error) {
      console.error(`Error in DonationService.getDonationsByCampId (${campId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve camp donations',
      };
    }
  }

  /**
   * Create a new camp donation
   */
  public async createCampDonation(
    campId: number,
    createCampDonationDto: ICreateCampDonation
  ): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const response = await apiClient.post<IApiResponse<DonationResponseDto>>(
        `/api/camps/${campId}/donations`,
        createCampDonationDto
      );
      return response;
    } catch (error) {
      console.error('Error in DonationService.createCampDonation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create camp donation',
      };
    }
  }

  /**
   * Accept a camp donation (club admin only)
   */
  public async acceptCampDonation(
    campId: number,
    donationId: number
  ): Promise<IApiResponse<DonationResponseDto>> {
    try {
      const response = await apiClient.put<IApiResponse<DonationResponseDto>>(
        `/api/camps/${campId}/donations/${donationId}/accept`,
        {}
      );
      return response;
    } catch (error) {
      console.error(`Error in DonationService.acceptCampDonation (${donationId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept camp donation',
      };
    }
  }
}

// Export singleton instance
export const donationService = DonationService.getInstance();
export default donationService;

