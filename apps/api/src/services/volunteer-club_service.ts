import { VolunteerClubDao } from '../dao';
import { 
  CreateVolunteerClubDto, 
  UpdateVolunteerClubDto, 
  VolunteerClubResponseDto,
  IApiResponse
} from '@nx-mono-repo-deployment-test/shared';

/**
 * Service layer for Volunteer Club business logic
 */
class VolunteerClubService {
  private static instance: VolunteerClubService;
  private volunteerClubDao: VolunteerClubDao;

  private constructor(volunteerClubDao: VolunteerClubDao) {
    this.volunteerClubDao = volunteerClubDao;
  }

  /**
   * Get VolunteerClubService singleton instance
   */
  public static getInstance(): VolunteerClubService {
    if (!VolunteerClubService.instance) {
      VolunteerClubService.instance = new VolunteerClubService(
        VolunteerClubDao.getInstance()
      );
    }
    return VolunteerClubService.instance;
  }

  /**
   * Create a new volunteer club
   */
  public async createVolunteerClub(createDto: CreateVolunteerClubDto): Promise<IApiResponse<VolunteerClubResponseDto>> {
    try {
      // Check if name already exists
      const nameExists = await this.volunteerClubDao.nameExists(createDto.name);
      if (nameExists) {
        return {
          success: false,
          error: 'A volunteer club with this name already exists',
        };
      }

      const club = await this.volunteerClubDao.create(createDto);
      return {
        success: true,
        data: new VolunteerClubResponseDto(club),
        message: 'Volunteer club created successfully',
      };
    } catch (error) {
      console.error('Error in VolunteerClubService.createVolunteerClub:', error);
      return {
        success: false,
        error: 'Failed to create volunteer club',
      };
    }
  }

  /**
   * Get volunteer club by ID
   */
  public async getVolunteerClubById(id: number): Promise<IApiResponse<VolunteerClubResponseDto>> {
    try {
      const club = await this.volunteerClubDao.findById(id);
      if (!club) {
        return {
          success: false,
          error: 'Volunteer club not found',
        };
      }
      return {
        success: true,
        data: new VolunteerClubResponseDto(club),
      };
    } catch (error) {
      console.error(`Error in VolunteerClubService.getVolunteerClubById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve volunteer club',
      };
    }
  }

  /**
   * Get all volunteer clubs
   */
  public async getAllVolunteerClubs(): Promise<IApiResponse<VolunteerClubResponseDto[]>> {
    try {
      const clubs = await this.volunteerClubDao.findAll();
      return {
        success: true,
        data: clubs.map(club => new VolunteerClubResponseDto(club)),
      };
    } catch (error) {
      console.error('Error in VolunteerClubService.getAllVolunteerClubs:', error);
      return {
        success: false,
        error: 'Failed to retrieve volunteer clubs',
      };
    }
  }

  /**
   * Update a volunteer club
   */
  public async updateVolunteerClub(id: number, updateDto: UpdateVolunteerClubDto): Promise<IApiResponse<VolunteerClubResponseDto>> {
    try {
      // Check if name already exists (excluding current club)
      if (updateDto.name) {
        const nameExists = await this.volunteerClubDao.nameExists(updateDto.name, id);
        if (nameExists) {
          return {
            success: false,
            error: 'A volunteer club with this name already exists',
          };
        }
      }

      const club = await this.volunteerClubDao.update(id, updateDto);
      if (!club) {
        return {
          success: false,
          error: 'Volunteer club not found',
        };
      }
      return {
        success: true,
        data: new VolunteerClubResponseDto(club),
        message: 'Volunteer club updated successfully',
      };
    } catch (error) {
      console.error(`Error in VolunteerClubService.updateVolunteerClub (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update volunteer club',
      };
    }
  }

  /**
   * Delete a volunteer club
   */
  public async deleteVolunteerClub(id: number): Promise<IApiResponse<void>> {
    try {
      const deleted = await this.volunteerClubDao.delete(id);
      if (!deleted) {
        return {
          success: false,
          error: 'Volunteer club not found',
        };
      }
      return {
        success: true,
        message: 'Volunteer club deleted successfully',
      };
    } catch (error) {
      console.error(`Error in VolunteerClubService.deleteVolunteerClub (${id}):`, error);
      return {
        success: false,
        error: 'Failed to delete volunteer club',
      };
    }
  }

  /**
   * Get volunteer club for authenticated volunteer club user
   */
  public async getMyClub(userId: number): Promise<IApiResponse<VolunteerClubResponseDto>> {
    try {
      const club = await this.volunteerClubDao.findByUserId(userId);
      if (!club) {
        return {
          success: false,
          error: 'No volunteer club found for this user',
        };
      }
      return {
        success: true,
        data: new VolunteerClubResponseDto(club),
      };
    } catch (error) {
      console.error(`Error in VolunteerClubService.getMyClub (${userId}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve volunteer club',
      };
    }
  }
}

export default VolunteerClubService;
export { VolunteerClubService };

