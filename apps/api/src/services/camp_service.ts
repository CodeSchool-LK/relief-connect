import { CampDao } from '../dao';
import { CreateCampDto, CampResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { CampType, CampNeed } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Service layer for Camp business logic
 * Handles validation and business rules
 */
class CampService {
  private static instance: CampService;
  private campDao: CampDao;

  private constructor(campDao: CampDao) {
    this.campDao = campDao;
  }

  /**
   * Get CampService singleton instance
   */
  public static getInstance(): CampService {
    if (!CampService.instance) {
      CampService.instance = new CampService(CampDao.getInstance());
    }
    return CampService.instance;
  }

  /**
   * Get all camps with optional filters
   */
  public async getAllCamps(filters?: {
    campType?: CampType;
    needs?: CampNeed[];
    district?: string;
  }): Promise<IApiResponse<CampResponseDto[]>> {
    try {
      const camps = await this.campDao.findAll(filters);
      const campDtos = camps.map(camp => new CampResponseDto(camp));

      return {
        success: true,
        data: campDtos,
        count: campDtos.length,
      };
    } catch (error) {
      console.error('Error in CampService.getAllCamps:', error);
      return {
        success: false,
        error: 'Failed to retrieve camps',
      };
    }
  }

  /**
   * Get camp by ID
   */
  public async getCampById(id: number): Promise<IApiResponse<CampResponseDto>> {
    try {
      const camp = await this.campDao.findById(id);

      if (!camp) {
        return {
          success: false,
          error: 'Camp not found',
        };
      }

      return {
        success: true,
        data: new CampResponseDto(camp),
      };
    } catch (error) {
      console.error(`Error in CampService.getCampById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve camp',
      };
    }
  }

  /**
   * Create a new camp
   */
  public async createCamp(createCampDto: CreateCampDto): Promise<IApiResponse<CampResponseDto>> {
    try {
      // Validate coordinates
      if (createCampDto.lat < -90 || createCampDto.lat > 90) {
        return {
          success: false,
          error: 'Invalid latitude',
        };
      }
      if (createCampDto.lng < -180 || createCampDto.lng > 180) {
        return {
          success: false,
          error: 'Invalid longitude',
        };
      }

      // Validate name
      if (!createCampDto.name || createCampDto.name.trim().length === 0) {
        return {
          success: false,
          error: 'Camp name is required',
        };
      }

      // Validate needs array
      if (!createCampDto.needs || createCampDto.needs.length === 0) {
        return {
          success: false,
          error: 'At least one need must be specified',
        };
      }

      // Validate short note
      if (!createCampDto.shortNote || createCampDto.shortNote.trim().length === 0) {
        return {
          success: false,
          error: 'Short note is required',
        };
      }
      if (createCampDto.shortNote.length > 500) {
        return {
          success: false,
          error: 'Short note must not exceed 500 characters',
        };
      }

      // Business logic: Trim whitespace
      const trimmedDto = new CreateCampDto({
        lat: createCampDto.lat,
        lng: createCampDto.lng,
        campType: createCampDto.campType,
        name: createCampDto.name.trim(),
        peopleRange: createCampDto.peopleRange,
        needs: createCampDto.needs,
        shortNote: createCampDto.shortNote.trim(),
        contactType: createCampDto.contactType,
        contact: createCampDto.contact?.trim(),
      });

      const camp = await this.campDao.create(trimmedDto);

      return {
        success: true,
        data: new CampResponseDto(camp),
        message: 'Camp created successfully',
      };
    } catch (error) {
      console.error('Error in CampService.createCamp:', error);
      return {
        success: false,
        error: 'Failed to create camp',
      };
    }
  }
}

export default CampService;

