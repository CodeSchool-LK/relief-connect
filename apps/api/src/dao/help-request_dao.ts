import HelpRequestModel from '../models/help-request.model';
import { 
  IHelpRequest, 
  CreateHelpRequestDto,
  HelpRequestCategory,
  Urgency,
  HelpRequestStatus
} from '@nx-mono-repo-deployment-test/shared';
import { Op } from 'sequelize';

class HelpRequestDao {
  private static instance: HelpRequestDao;

  private constructor() {}

  public static getInstance(): HelpRequestDao {
    if (!HelpRequestDao.instance) {
      HelpRequestDao.instance = new HelpRequestDao();
    }
    return HelpRequestDao.instance;
  }

  /**
   * Find all help requests, filtering out expired ones (30 days)
   * Optional filters: category, urgency, district (via approxArea)
   */
  public async findAll(filters?: {
    category?: HelpRequestCategory;
    urgency?: Urgency;
    district?: string;
  }): Promise<IHelpRequest[]> {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const whereClause: any = {
        [HelpRequestModel.HELP_REQUEST_CREATED_AT]: {
          [Op.gte]: thirtyDaysAgo, // Only get records created in last 30 days
        },
        [HelpRequestModel.HELP_REQUEST_STATUS]: HelpRequestStatus.OPEN,
      };

      // Apply optional filters
      if (filters?.category) {
        whereClause[HelpRequestModel.HELP_REQUEST_CATEGORY] = filters.category;
      }
      if (filters?.urgency) {
        whereClause[HelpRequestModel.HELP_REQUEST_URGENCY] = filters.urgency;
      }
      if (filters?.district) {
        whereClause[HelpRequestModel.HELP_REQUEST_APPROX_AREA] = {
          [Op.iLike]: `%${filters.district}%`,
        };
      }

      const helpRequests = await HelpRequestModel.findAll({
        where: whereClause,
        order: [[HelpRequestModel.HELP_REQUEST_CREATED_AT, 'DESC']],
      });
      return helpRequests.map(hr => hr.toJSON() as IHelpRequest);
    } catch (error) {
      console.error('Error in HelpRequestDao.findAll:', error);
      throw error;
    }
  }

  public async findById(id: number): Promise<IHelpRequest | null> {
    try {
      const helpRequest = await HelpRequestModel.findByPk(id);
      return helpRequest ? (helpRequest.toJSON() as IHelpRequest) : null;
    } catch (error) {
      console.error(`Error in HelpRequestDao.findById (${id}):`, error);
      throw error;
    }
  }

  public async create(createHelpRequestDto: CreateHelpRequestDto): Promise<IHelpRequest> {
    try {
      const helpRequest = await HelpRequestModel.create({
        [HelpRequestModel.HELP_REQUEST_LAT]: createHelpRequestDto.lat,
        [HelpRequestModel.HELP_REQUEST_LNG]: createHelpRequestDto.lng,
        [HelpRequestModel.HELP_REQUEST_CATEGORY]: createHelpRequestDto.category,
        [HelpRequestModel.HELP_REQUEST_URGENCY]: createHelpRequestDto.urgency,
        [HelpRequestModel.HELP_REQUEST_SHORT_NOTE]: createHelpRequestDto.shortNote,
        [HelpRequestModel.HELP_REQUEST_APPROX_AREA]: createHelpRequestDto.approxArea,
        [HelpRequestModel.HELP_REQUEST_CONTACT_TYPE]: createHelpRequestDto.contactType,
        [HelpRequestModel.HELP_REQUEST_CONTACT]: createHelpRequestDto.contact,
        [HelpRequestModel.HELP_REQUEST_STATUS]: HelpRequestStatus.OPEN,
      });
      return helpRequest.toJSON() as IHelpRequest;
    } catch (error) {
      console.error('Error in HelpRequestDao.create:', error);
      throw error;
    }
  }

  public async count(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return await HelpRequestModel.count({
        where: {
          [HelpRequestModel.HELP_REQUEST_CREATED_AT]: {
            [Op.gte]: thirtyDaysAgo,
          },
          [HelpRequestModel.HELP_REQUEST_STATUS]: HelpRequestStatus.OPEN,
        },
      });
    } catch (error) {
      console.error('Error in HelpRequestDao.count:', error);
      throw error;
    }
  }
}

export default HelpRequestDao;

