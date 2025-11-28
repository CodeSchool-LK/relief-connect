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

  public async create(createCampDto: CreateCampDto): Promise<ICamp> {
    try {
      const camp = await CampModel.create({
        [CampModel.CAMP_LAT]: createCampDto.lat,
        [CampModel.CAMP_LNG]: createCampDto.lng,
        [CampModel.CAMP_TYPE]: createCampDto.campType,
        [CampModel.CAMP_NAME]: createCampDto.name,
        [CampModel.CAMP_PEOPLE_RANGE]: createCampDto.peopleRange,
        [CampModel.CAMP_NEEDS]: createCampDto.needs,
        [CampModel.CAMP_SHORT_NOTE]: createCampDto.shortNote,
        [CampModel.CAMP_CONTACT_TYPE]: createCampDto.contactType,
        [CampModel.CAMP_CONTACT]: createCampDto.contact,
      });
      return camp.toJSON() as ICamp;
    } catch (error) {
      console.error('Error in CampDao.create:', error);
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

