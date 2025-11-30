import CampModel from '../models/camp.model';
import { 
  ICamp, 
  CreateCampDto,
  CampType,
  CampNeed
} from '@nx-mono-repo-deployment-test/shared';
import { Op } from 'sequelize';

class CampDao {
  private static instance: CampDao;

  private constructor() {}

  public static getInstance(): CampDao {
    if (!CampDao.instance) {
      CampDao.instance = new CampDao();
    }
    return CampDao.instance;
  }

  /**
   * Find all camps, filtering out expired ones (30 days)
   * Optional filters: campType, needs, district (via name)
   */
  public async findAll(filters?: {
    campType?: CampType;
    needs?: CampNeed[];
    district?: string;
  }): Promise<ICamp[]> {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const whereClause: any = {
        [CampModel.CAMP_CREATED_AT]: {
          [Op.gte]: thirtyDaysAgo, // Only get records created in last 30 days
        },
      };

      // Apply optional filters
      if (filters?.campType) {
        whereClause[CampModel.CAMP_TYPE] = filters.campType;
      }
      if (filters?.needs && filters.needs.length > 0) {
        whereClause[CampModel.CAMP_NEEDS] = {
          [Op.overlap]: filters.needs, // PostgreSQL array overlap operator
        };
      }
      if (filters?.district) {
        whereClause[CampModel.CAMP_NAME] = {
          [Op.iLike]: `%${filters.district}%`,
        };
      }

      const camps = await CampModel.findAll({
        where: whereClause,
        order: [[CampModel.CAMP_CREATED_AT, 'DESC']],
      });
      return camps.map(camp => camp.toJSON() as ICamp);
    } catch (error) {
      console.error('Error in CampDao.findAll:', error);
      throw error;
    }
  }

  public async findById(id: number): Promise<ICamp | null> {
    try {
      const camp = await CampModel.findByPk(id);
      return camp ? (camp.toJSON() as ICamp) : null;
    } catch (error) {
      console.error(`Error in CampDao.findById (${id}):`, error);
      throw error;
    }
  }

  public async create(createCampDto: CreateCampDto, volunteerClubId?: number): Promise<ICamp> {
    try {
      const camp = await CampModel.create({
        [CampModel.CAMP_LAT]: createCampDto.lat,
        [CampModel.CAMP_LNG]: createCampDto.lng,
        [CampModel.CAMP_TYPE]: createCampDto.campType,
        [CampModel.CAMP_NAME]: createCampDto.name,
        [CampModel.CAMP_PEOPLE_RANGE]: createCampDto.peopleRange,
        [CampModel.CAMP_PEOPLE_COUNT]: createCampDto.peopleCount,
        [CampModel.CAMP_NEEDS]: createCampDto.needs,
        [CampModel.CAMP_SHORT_NOTE]: createCampDto.shortNote,
        [CampModel.CAMP_DESCRIPTION]: createCampDto.description,
        [CampModel.CAMP_LOCATION]: createCampDto.location,
        [CampModel.CAMP_CONTACT_TYPE]: createCampDto.contactType,
        [CampModel.CAMP_CONTACT]: createCampDto.contact,
        [CampModel.CAMP_VOLUNTEER_CLUB_ID]: volunteerClubId,
      });
      return camp.toJSON() as ICamp;
    } catch (error) {
      console.error('Error in CampDao.create:', error);
      throw error;
    }
  }

  public async update(id: number, updateData: Partial<ICamp>): Promise<ICamp | null> {
    try {
      const camp = await CampModel.findByPk(id);
      if (!camp) {
        return null;
      }

      const updateFields: any = {};
      if (updateData.lat !== undefined) updateFields[CampModel.CAMP_LAT] = updateData.lat;
      if (updateData.lng !== undefined) updateFields[CampModel.CAMP_LNG] = updateData.lng;
      if (updateData.campType !== undefined) updateFields[CampModel.CAMP_TYPE] = updateData.campType;
      if (updateData.name !== undefined) updateFields[CampModel.CAMP_NAME] = updateData.name;
      if (updateData.peopleRange !== undefined) updateFields[CampModel.CAMP_PEOPLE_RANGE] = updateData.peopleRange;
      if (updateData.peopleCount !== undefined) updateFields[CampModel.CAMP_PEOPLE_COUNT] = updateData.peopleCount;
      if (updateData.needs !== undefined) updateFields[CampModel.CAMP_NEEDS] = updateData.needs;
      if (updateData.shortNote !== undefined) updateFields[CampModel.CAMP_SHORT_NOTE] = updateData.shortNote;
      if (updateData.description !== undefined) updateFields[CampModel.CAMP_DESCRIPTION] = updateData.description;
      if (updateData.location !== undefined) updateFields[CampModel.CAMP_LOCATION] = updateData.location;
      if (updateData.contactType !== undefined) updateFields[CampModel.CAMP_CONTACT_TYPE] = updateData.contactType;
      if (updateData.contact !== undefined) updateFields[CampModel.CAMP_CONTACT] = updateData.contact;
      if (updateData.status !== undefined) updateFields[CampModel.CAMP_STATUS] = updateData.status;

      await camp.update(updateFields);
      return camp.toJSON() as ICamp;
    } catch (error) {
      console.error(`Error in CampDao.update (${id}):`, error);
      throw error;
    }
  }

  public async count(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return await CampModel.count({
        where: {
          [CampModel.CAMP_CREATED_AT]: {
            [Op.gte]: thirtyDaysAgo,
          },
        },
      });
    } catch (error) {
      console.error('Error in CampDao.count:', error);
      throw error;
    }
  }
}

export default CampDao;

