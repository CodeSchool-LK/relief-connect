import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { IMembership, IRequestMembership, IReviewMembership } from '../types/membership';

/**
 * Membership Service
 * Handles all membership-related API calls
 */
class MembershipService {
  private static instance: MembershipService;
  private readonly basePath = '/api/memberships';

  private constructor() {}

  /**
   * Get MembershipService singleton instance
   */
  public static getInstance(): MembershipService {
    if (!MembershipService.instance) {
      MembershipService.instance = new MembershipService();
    }
    return MembershipService.instance;
  }

  /**
   * Request to join a volunteer club
   */
  public async requestMembership(data: IRequestMembership): Promise<IApiResponse<IMembership>> {
    try {
      const response = await apiClient.post<IApiResponse<IMembership>>(`${this.basePath}/request`, data);
      return response;
    } catch (error) {
      console.error('Error in MembershipService.requestMembership:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit membership request',
      };
    }
  }

  /**
   * Get user's memberships
   */
  public async getMyMemberships(): Promise<IApiResponse<IMembership[]>> {
    try {
      const response = await apiClient.get<IApiResponse<IMembership[]>>(`${this.basePath}/me`);
      return response;
    } catch (error) {
      console.error('Error in MembershipService.getMyMemberships:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch memberships',
      };
    }
  }

  /**
   * Get club memberships (club admins or system admins)
   */
  public async getClubMemberships(clubId: number): Promise<IApiResponse<IMembership[]>> {
    try {
      const response = await apiClient.get<IApiResponse<IMembership[]>>(`${this.basePath}/club/${clubId}`);
      return response;
    } catch (error) {
      console.error(`Error in MembershipService.getClubMemberships (${clubId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch club memberships',
      };
    }
  }

  /**
   * Get membership by ID
   */
  public async getMembershipById(id: number): Promise<IApiResponse<IMembership>> {
    try {
      const response = await apiClient.get<IApiResponse<IMembership>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in MembershipService.getMembershipById (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch membership',
      };
    }
  }

  /**
   * Review (approve/reject) a membership request
   */
  public async reviewMembership(id: number, data: IReviewMembership): Promise<IApiResponse<IMembership>> {
    try {
      const response = await apiClient.put<IApiResponse<IMembership>>(`${this.basePath}/${id}/review`, data);
      return response;
    } catch (error) {
      console.error(`Error in MembershipService.reviewMembership (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to review membership request',
      };
    }
  }

  /**
   * Cancel a membership request
   */
  public async cancelMembership(id: number): Promise<IApiResponse<void>> {
    try {
      const response = await apiClient.delete<IApiResponse<void>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in MembershipService.cancelMembership (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel membership request',
      };
    }
  }
}

// Export singleton instance
export const membershipService = MembershipService.getInstance();
export default membershipService;

