import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { IVolunteerClub, ICreateVolunteerClub, IUpdateVolunteerClub } from '../types/volunteer-club';

/**
 * Volunteer Club Service
 * Handles all volunteer club-related API calls
 */
class VolunteerClubService {
  private static instance: VolunteerClubService;
  private readonly basePath = '/api/volunteer-clubs';

  private constructor() {}

  /**
   * Get VolunteerClubService singleton instance
   */
  public static getInstance(): VolunteerClubService {
    if (!VolunteerClubService.instance) {
      VolunteerClubService.instance = new VolunteerClubService();
    }
    return VolunteerClubService.instance;
  }

  /**
   * Get all volunteer clubs
   */
  public async getAllVolunteerClubs(): Promise<IApiResponse<IVolunteerClub[]>> {
    try {
      const response = await apiClient.get<IApiResponse<IVolunteerClub[]>>(this.basePath);
      return response;
    } catch (error) {
      console.error('Error in VolunteerClubService.getAllVolunteerClubs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch volunteer clubs',
      };
    }
  }

  /**
   * Get volunteer club by ID
   */
  public async getVolunteerClubById(id: number): Promise<IApiResponse<IVolunteerClub>> {
    try {
      const response = await apiClient.get<IApiResponse<IVolunteerClub>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in VolunteerClubService.getVolunteerClubById (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch volunteer club',
      };
    }
  }

  /**
   * Create a new volunteer club (admin only)
   */
  public async createVolunteerClub(data: ICreateVolunteerClub): Promise<IApiResponse<IVolunteerClub>> {
    try {
      const response = await apiClient.post<IApiResponse<IVolunteerClub>>(this.basePath, data);
      return response;
    } catch (error) {
      console.error('Error in VolunteerClubService.createVolunteerClub:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create volunteer club',
      };
    }
  }

  /**
   * Update a volunteer club (admin only)
   */
  public async updateVolunteerClub(id: number, data: IUpdateVolunteerClub): Promise<IApiResponse<IVolunteerClub>> {
    try {
      const response = await apiClient.put<IApiResponse<IVolunteerClub>>(`${this.basePath}/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error in VolunteerClubService.updateVolunteerClub (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update volunteer club',
      };
    }
  }

  /**
   * Delete a volunteer club (admin only)
   */
  public async deleteVolunteerClub(id: number): Promise<IApiResponse<void>> {
    try {
      const response = await apiClient.delete<IApiResponse<void>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in VolunteerClubService.deleteVolunteerClub (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete volunteer club',
      };
    }
  }

  /**
   * Get my volunteer club (volunteer club only)
   */
  public async getMyClub(): Promise<IApiResponse<IVolunteerClub>> {
    try {
      const response = await apiClient.get<IApiResponse<IVolunteerClub>>(`${this.basePath}/me`);
      return response;
    } catch (error) {
      console.error('Error in VolunteerClubService.getMyClub:', error);
      // Handle 404 specifically - club not found is a valid state
      const errorObj = error as Error & { status?: number; details?: unknown };
      if (errorObj.status === 404) {
        return {
          success: false,
          error: 'No volunteer club found for this user',
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch my volunteer club',
      };
    }
  }
}

// Export singleton instance
export const volunteerClubService = VolunteerClubService.getInstance();
export default volunteerClubService;

