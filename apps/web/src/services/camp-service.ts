import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ICreateCamp } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICreateCamp';
import { CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/response/camp_response_dto';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import { ICampDropOffLocation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampDropOffLocation';
import { CampFilters } from '../types/camp';

/**
 * Camp Service
 * Handles all camp-related API calls
 */
class CampService {
  private static instance: CampService;
  private readonly basePath = '/api/camps';

  private constructor() {}

  /**
   * Get CampService singleton instance
   */
  public static getInstance(): CampService {
    if (!CampService.instance) {
      CampService.instance = new CampService();
    }
    return CampService.instance;
  }

  /**
   * Get all camps with optional filters
   */
  public async getAllCamps(
    filters?: CampFilters
  ): Promise<IApiResponse<CampResponseDto[]>> {
    try {
      const params: Record<string, string> = {};
      if (filters?.campType) params.campType = filters.campType;
      if (filters?.needs && filters.needs.length > 0) {
        params.needs = filters.needs.join(',');
      }
      if (filters?.district) params.district = filters.district;

      const response = await apiClient.get<IApiResponse<CampResponseDto[]>>(
        this.basePath,
        params
      );
      return response;
    } catch (error) {
      console.error('Error in CampService.getAllCamps:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch camps',
      };
    }
  }

  /**
   * Get a single camp by ID
   */
  public async getCampById(id: number): Promise<IApiResponse<CampResponseDto>> {
    try {
      const response = await apiClient.get<IApiResponse<CampResponseDto>>(
        `${this.basePath}/${id}`
      );
      return response;
    } catch (error) {
      console.error('Error in CampService.getCampById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch camp',
      };
    }
  }

  /**
   * Update an existing camp
   */
  public async updateCamp(
    id: number,
    updateCampDto: Partial<ICreateCamp>
  ): Promise<IApiResponse<CampResponseDto>> {
    try {
      const response = await apiClient.put<IApiResponse<CampResponseDto>>(
        `${this.basePath}/${id}`,
        updateCampDto
      );
      return response;
    } catch (error) {
      console.error('Error in CampService.updateCamp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update camp',
      };
    }
  }

  /**
   * Create a new camp
   */
  public async createCamp(
    createCampDto: ICreateCamp
  ): Promise<IApiResponse<CampResponseDto>> {
    try {
      const response = await apiClient.post<IApiResponse<CampResponseDto>>(
        this.basePath,
        createCampDto
      );
      return response;
    } catch (error) {
      console.error('Error in CampService.createCamp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create camp',
      };
    }
  }

  /**
   * Get inventory items for a camp
   */
  public async getCampInventoryItems(id: number): Promise<IApiResponse<ICampInventoryItem[]>> {
    try {
      const response = await apiClient.get<IApiResponse<ICampInventoryItem[]>>(
        `${this.basePath}/${id}/inventory`
      );
      return response;
    } catch (error) {
      console.error('Error in CampService.getCampInventoryItems:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch camp inventory items',
      };
    }
  }

  /**
   * Get all drop-off locations for active camps
   */
  public async getAllDropOffLocations(): Promise<IApiResponse<Array<ICampDropOffLocation & { campName?: string; campId?: number }>>> {
    try {
      const response = await apiClient.get<IApiResponse<Array<ICampDropOffLocation & { campName?: string; campId?: number }>>>(
        `${this.basePath}/drop-off-locations`
      );
      return response;
    } catch (error) {
      console.error('Error in CampService.getAllDropOffLocations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch drop-off locations',
      };
    }
  }
}

// Export singleton instance
export const campService = CampService.getInstance();
export default campService;

