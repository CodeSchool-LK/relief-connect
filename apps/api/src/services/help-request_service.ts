import { HelpRequestDao } from '../dao';
import { CreateHelpRequestDto, HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { HelpRequestCategory, Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Service layer for HelpRequest business logic
 * Handles validation and business rules
 */
class HelpRequestService {
  private static instance: HelpRequestService;
  private helpRequestDao: HelpRequestDao;

  private constructor(helpRequestDao: HelpRequestDao) {
    this.helpRequestDao = helpRequestDao;
  }

  /**
   * Get HelpRequestService singleton instance
   */
  public static getInstance(): HelpRequestService {
    if (!HelpRequestService.instance) {
      HelpRequestService.instance = new HelpRequestService(HelpRequestDao.getInstance());
    }
    return HelpRequestService.instance;
  }

  /**
   * Get all help requests with optional filters
   */
  public async getAllHelpRequests(filters?: {
    category?: HelpRequestCategory;
    urgency?: Urgency;
    district?: string;
  }): Promise<IApiResponse<HelpRequestResponseDto[]>> {
    try {
      const helpRequests = await this.helpRequestDao.findAll(filters);
      const helpRequestDtos = helpRequests.map(hr => new HelpRequestResponseDto(hr));

      return {
        success: true,
        data: helpRequestDtos,
        count: helpRequestDtos.length,
      };
    } catch (error) {
      console.error('Error in HelpRequestService.getAllHelpRequests:', error);
      return {
        success: false,
        error: 'Failed to retrieve help requests',
      };
    }
  }

  /**
   * Get help request by ID
   */
  public async getHelpRequestById(id: number): Promise<IApiResponse<HelpRequestResponseDto>> {
    try {
      const helpRequest = await this.helpRequestDao.findById(id);

      if (!helpRequest) {
        return {
          success: false,
          error: 'Help request not found',
        };
      }

      return {
        success: true,
        data: new HelpRequestResponseDto(helpRequest),
      };
    } catch (error) {
      console.error(`Error in HelpRequestService.getHelpRequestById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve help request',
      };
    }
  }

  /**
   * Create a new help request
   */
  public async createHelpRequest(createHelpRequestDto: CreateHelpRequestDto): Promise<IApiResponse<HelpRequestResponseDto>> {
    try {
      // Validate coordinates
      if (createHelpRequestDto.lat < -90 || createHelpRequestDto.lat > 90) {
        return {
          success: false,
          error: 'Invalid latitude',
        };
      }
      if (createHelpRequestDto.lng < -180 || createHelpRequestDto.lng > 180) {
        return {
          success: false,
          error: 'Invalid longitude',
        };
      }

      // Validate short note length
      if (!createHelpRequestDto.shortNote || createHelpRequestDto.shortNote.trim().length === 0) {
        return {
          success: false,
          error: 'Short note is required',
        };
      }
      if (createHelpRequestDto.shortNote.length > 160) {
        return {
          success: false,
          error: 'Short note must not exceed 160 characters',
        };
      }

      // Business logic: Trim whitespace
      const trimmedDto = new CreateHelpRequestDto({
        lat: createHelpRequestDto.lat,
        lng: createHelpRequestDto.lng,
        category: createHelpRequestDto.category,
        urgency: createHelpRequestDto.urgency,
        shortNote: createHelpRequestDto.shortNote.trim(),
        approxArea: createHelpRequestDto.approxArea.trim(),
        contactType: createHelpRequestDto.contactType,
        contact: createHelpRequestDto.contact?.trim(),
      });

      const helpRequest = await this.helpRequestDao.create(trimmedDto);

      return {
        success: true,
        data: new HelpRequestResponseDto(helpRequest),
        message: 'Help request created successfully',
      };
    } catch (error) {
      console.error('Error in HelpRequestService.createHelpRequest:', error);
      return {
        success: false,
        error: 'Failed to create help request',
      };
    }
  }
}

export default HelpRequestService;

