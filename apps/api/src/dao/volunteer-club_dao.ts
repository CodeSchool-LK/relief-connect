import VolunteerClubModel from '../models/volunteer-club.model';
import { 
  IVolunteerClub, 
  CreateVolunteerClubDto,
  UpdateVolunteerClubDto,
  UserStatus
} from '@nx-mono-repo-deployment-test/shared';

class VolunteerClubDao {
  private static instance: VolunteerClubDao;

  private constructor() {}

  public static getInstance(): VolunteerClubDao {
    if (!VolunteerClubDao.instance) {
      VolunteerClubDao.instance = new VolunteerClubDao();
    }
    return VolunteerClubDao.instance;
  }

  /**
   * Find volunteer club by ID
   */
  public async findById(id: number): Promise<IVolunteerClub | null> {
    try {
      const club = await VolunteerClubModel.findByPk(id);
      return club ? (club.toJSON() as IVolunteerClub) : null;
    } catch (error) {
      console.error(`Error in VolunteerClubDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Find all volunteer clubs
   */
  public async findAll(): Promise<IVolunteerClub[]> {
    try {
      const clubs = await VolunteerClubModel.findAll({
        order: [['createdAt', 'DESC']],
      });
      return clubs.map(club => club.toJSON() as IVolunteerClub);
    } catch (error) {
      console.error('Error in VolunteerClubDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Find volunteer club by name
   */
  public async findByName(name: string): Promise<IVolunteerClub | null> {
    try {
      const club = await VolunteerClubModel.findOne({
        where: {
          [VolunteerClubModel.VOLUNTEER_CLUB_NAME]: name,
        },
      });
      return club ? (club.toJSON() as IVolunteerClub) : null;
    } catch (error) {
      console.error(`Error in VolunteerClubDao.findByName (${name}):`, error);
      throw error;
    }
  }

  /**
   * Find volunteer club by user ID
   */
  public async findByUserId(userId: number): Promise<IVolunteerClub | null> {
    try {
      const club = await VolunteerClubModel.findOne({
        where: {
          [VolunteerClubModel.VOLUNTEER_CLUB_USER_ID]: userId,
        },
      });
      return club ? (club.toJSON() as IVolunteerClub) : null;
    } catch (error) {
      console.error(`Error in VolunteerClubDao.findByUserId (${userId}):`, error);
      throw error;
    }
  }

  /**
   * Create a new volunteer club
   */
  public async create(createDto: CreateVolunteerClubDto): Promise<IVolunteerClub> {
    try {
      const club = await VolunteerClubModel.create({
        [VolunteerClubModel.VOLUNTEER_CLUB_NAME]: createDto.name,
        [VolunteerClubModel.VOLUNTEER_CLUB_DESCRIPTION]: createDto.description,
        [VolunteerClubModel.VOLUNTEER_CLUB_CONTACT_NUMBER]: createDto.contactNumber,
        [VolunteerClubModel.VOLUNTEER_CLUB_EMAIL]: createDto.email,
        [VolunteerClubModel.VOLUNTEER_CLUB_ADDRESS]: createDto.address,
        [VolunteerClubModel.VOLUNTEER_CLUB_USER_ID]: createDto.userId,
        [VolunteerClubModel.VOLUNTEER_CLUB_STATUS]: UserStatus.ACTIVE,
      });
      return club.toJSON() as IVolunteerClub;
    } catch (error) {
      console.error('Error in VolunteerClubDao.create:', error);
      throw error;
    }
  }

  /**
   * Update a volunteer club
   */
  public async update(id: number, updateDto: UpdateVolunteerClubDto): Promise<IVolunteerClub | null> {
    try {
      const club = await VolunteerClubModel.findByPk(id);
      if (!club) {
        return null;
      }

      const updateData: Partial<IVolunteerClub> = {};
      if (updateDto.name !== undefined) {
        updateData.name = updateDto.name;
      }
      if (updateDto.description !== undefined) {
        updateData.description = updateDto.description;
      }
      if (updateDto.contactNumber !== undefined) {
        updateData.contactNumber = updateDto.contactNumber;
      }
      if (updateDto.email !== undefined) {
        updateData.email = updateDto.email;
      }
      if (updateDto.address !== undefined) {
        updateData.address = updateDto.address;
      }
      if (updateDto.userId !== undefined) {
        updateData.userId = updateDto.userId;
      }

      await club.update(updateData);
      return club.toJSON() as IVolunteerClub;
    } catch (error) {
      console.error(`Error in VolunteerClubDao.update (${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a volunteer club
   */
  public async delete(id: number): Promise<boolean> {
    try {
      const club = await VolunteerClubModel.findByPk(id);
      if (!club) {
        return false;
      }
      await club.destroy();
      return true;
    } catch (error) {
      console.error(`Error in VolunteerClubDao.delete (${id}):`, error);
      throw error;
    }
  }

  /**
   * Check if volunteer club name already exists
   */
  public async nameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const whereClause: any = {
        [VolunteerClubModel.VOLUNTEER_CLUB_NAME]: name,
      };
      if (excludeId) {
        whereClause[VolunteerClubModel.VOLUNTEER_CLUB_ID] = { $ne: excludeId };
      }
      const count = await VolunteerClubModel.count({
        where: whereClause,
      });
      return count > 0;
    } catch (error) {
      console.error(`Error in VolunteerClubDao.nameExists (${name}):`, error);
      throw error;
    }
  }
}

export default VolunteerClubDao;

