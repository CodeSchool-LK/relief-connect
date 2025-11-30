import HelpRequestModel from '../models/help-request.model';
import HelpRequestInventoryItemModel from '../models/help-request-inventory-item.model';
import { 
  IHelpRequest, 
  CreateHelpRequestDto,
  Urgency,
  HelpRequestStatus,
  IHelpRequestSummary,
  IRationItemInventorySummary
} from '@nx-mono-repo-deployment-test/shared';
import { Op, Sequelize } from 'sequelize';

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
   * Optional filters: urgency, district (via approxArea), bounds (viewport filtering)
   * Optional pagination: page, limit
   */
  public async findAll(filters?: {
    urgency?: Urgency;
    district?: string;
    bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
    page?: number;
    limit?: number;
  }): Promise<{ data: IHelpRequest[]; total: number }> {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const whereClause: Record<string, unknown> = {
        [HelpRequestModel.HELP_REQUEST_CREATED_AT]: {
          [Op.gte]: thirtyDaysAgo, // Only get records created in last 30 days
        },
        [HelpRequestModel.HELP_REQUEST_STATUS]: HelpRequestStatus.OPEN,
      };

      // Apply optional filters
      if (filters?.urgency) {
        whereClause[HelpRequestModel.HELP_REQUEST_URGENCY] = filters.urgency;
      }
      if (filters?.district) {
        whereClause[HelpRequestModel.HELP_REQUEST_APPROX_AREA] = {
          [Op.iLike]: `%${filters.district}%`,
        };
      }
      // Apply bounds filtering if provided
      if (filters?.bounds) {
        const { minLat, maxLat, minLng, maxLng } = filters.bounds;
        // Validate bounds
        if (minLat < maxLat && minLng < maxLng) {
          whereClause[HelpRequestModel.HELP_REQUEST_LAT] = {
            [Op.between]: [minLat, maxLat],
          };
          whereClause[HelpRequestModel.HELP_REQUEST_LNG] = {
            [Op.between]: [minLng, maxLng],
          };
        }
      }

      // Get total count for pagination
      const total = await HelpRequestModel.count({ where: whereClause });

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const offset = (page - 1) * limit;

      const helpRequests = await HelpRequestModel.findAll({
        where: whereClause,
        order: [[HelpRequestModel.HELP_REQUEST_CREATED_AT, 'DESC']],
        limit,
        offset,
      });
      
      return {
        data: helpRequests.map(hr => hr.toJSON() as IHelpRequest),
        total,
      };
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

  /**
   * Find all help requests created by a specific user
   * Includes all statuses (not just OPEN) and all dates (not just last 30 days)
   */
  public async findByUserId(userId: number): Promise<IHelpRequest[]> {
    try {
      const helpRequests = await HelpRequestModel.findAll({
        where: {
          [HelpRequestModel.HELP_REQUEST_USER_ID]: userId,
        },
        order: [[HelpRequestModel.HELP_REQUEST_CREATED_AT, 'DESC']],
      });
      return helpRequests.map(hr => hr.toJSON() as IHelpRequest);
    } catch (error) {
      console.error(`Error in HelpRequestDao.findByUserId (${userId}):`, error);
      throw error;
    }
  }

  public async create(createHelpRequestDto: CreateHelpRequestDto, userId?: number): Promise<IHelpRequest> {
    try {
      // Extract ration items array from DTO (service passes array format for database storage)
      // The DTO now accepts Record<string, number>, but service converts to array before calling DAO
      const rationItemsArray = Array.isArray(createHelpRequestDto.rationItems) 
        ? createHelpRequestDto.rationItems 
        : (createHelpRequestDto.rationItems ? Object.keys(createHelpRequestDto.rationItems) : undefined);

      const helpRequest = await HelpRequestModel.create({
        [HelpRequestModel.HELP_REQUEST_USER_ID]: userId,
        [HelpRequestModel.HELP_REQUEST_LAT]: createHelpRequestDto.lat,
        [HelpRequestModel.HELP_REQUEST_LNG]: createHelpRequestDto.lng,
        [HelpRequestModel.HELP_REQUEST_URGENCY]: createHelpRequestDto.urgency,
        [HelpRequestModel.HELP_REQUEST_SHORT_NOTE]: createHelpRequestDto.shortNote,
        [HelpRequestModel.HELP_REQUEST_APPROX_AREA]: createHelpRequestDto.approxArea,
        [HelpRequestModel.HELP_REQUEST_CONTACT_TYPE]: createHelpRequestDto.contactType,
        [HelpRequestModel.HELP_REQUEST_CONTACT]: createHelpRequestDto.contact,
        [HelpRequestModel.HELP_REQUEST_NAME]: createHelpRequestDto.name,
        [HelpRequestModel.HELP_REQUEST_TOTAL_PEOPLE]: createHelpRequestDto.totalPeople,
        [HelpRequestModel.HELP_REQUEST_ELDERS]: createHelpRequestDto.elders,
        [HelpRequestModel.HELP_REQUEST_CHILDREN]: createHelpRequestDto.children,
        [HelpRequestModel.HELP_REQUEST_PETS]: createHelpRequestDto.pets,
        [HelpRequestModel.HELP_REQUEST_RATION_ITEMS]: rationItemsArray,
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

  /**
   * Get comprehensive summary statistics for help requests
   * Uses database-level aggregations for optimal performance
   * Returns counts by urgency, status, district, people totals, and ration items
   */
  public async getSummary(): Promise<IHelpRequestSummary> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const whereClause = {
        [HelpRequestModel.HELP_REQUEST_CREATED_AT]: {
          [Op.gte]: thirtyDaysAgo,
        },
      };

      // Get help request IDs that match the date filter for inventory query
      const helpRequestIds = await HelpRequestModel.findAll({
        where: whereClause,
        attributes: [HelpRequestModel.HELP_REQUEST_ID],
        raw: true,
      });
      const helpRequestIdArray = (helpRequestIds as unknown as Array<Record<string, unknown>>)
        .map(hr => hr[HelpRequestModel.HELP_REQUEST_ID] as number)
        .filter((id): id is number => id !== undefined && id !== null);

      // Execute all aggregation queries in parallel for better performance
      const [
        total,
        urgencyGroups,
        statusGroups,
        districtGroups,
        peopleSums,
        inventoryItemsData,
      ] = await Promise.all([
        // Total count
        HelpRequestModel.count({ where: whereClause }),

        // Count by urgency
        HelpRequestModel.findAll({
          where: whereClause,
          attributes: [
            HelpRequestModel.HELP_REQUEST_URGENCY,
            [Sequelize.fn('COUNT', Sequelize.literal('*')), 'count'],
          ],
          group: [HelpRequestModel.HELP_REQUEST_URGENCY],
          raw: true,
        }),

        // Count by status
        HelpRequestModel.findAll({
          where: whereClause,
          attributes: [
            HelpRequestModel.HELP_REQUEST_STATUS,
            [Sequelize.fn('COUNT', Sequelize.literal('*')), 'count'],
          ],
          group: [HelpRequestModel.HELP_REQUEST_STATUS],
          raw: true,
        }),

        // Count by district
        HelpRequestModel.findAll({
          where: whereClause,
          attributes: [
            HelpRequestModel.HELP_REQUEST_APPROX_AREA,
            [Sequelize.fn('COUNT', Sequelize.literal('*')), 'count'],
          ],
          group: [HelpRequestModel.HELP_REQUEST_APPROX_AREA],
          raw: true,
        }),

        // Sum people counts
        HelpRequestModel.findOne({
          where: whereClause,
          attributes: [
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_TOTAL_PEOPLE)), 0), 'totalPeople'],
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_ELDERS)), 0), 'elders'],
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_CHILDREN)), 0), 'children'],
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestModel.HELP_REQUEST_PETS)), 0), 'pets'],
          ],
          raw: true,
        }),

        // Get inventory items aggregated by itemName (optimized database query)
        helpRequestIdArray.length > 0
          ? HelpRequestInventoryItemModel.findAll({
              where: {
                [HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID]: {
                  [Op.in]: helpRequestIdArray,
                },
              },
              attributes: [
                HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME,
                [
                  Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_NEEDED)), 0),
                  'totalQuantityNeeded',
                ],
                [
                  Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED)), 0),
                  'totalQuantityDonated',
                ],
                [
                  Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING)), 0),
                  'totalQuantityPending',
                ],
                [
                  Sequelize.fn('COUNT', Sequelize.literal('*')),
                  'requestCount',
                ],
              ],
              group: [HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME],
              raw: true,
            })
          : [],
      ]);

      // Initialize counts with default values
      const byUrgency: Record<Urgency, number> = {
        [Urgency.LOW]: 0,
        [Urgency.MEDIUM]: 0,
        [Urgency.HIGH]: 0,
      };

      const byStatus: Record<HelpRequestStatus, number> = {
        [HelpRequestStatus.OPEN]: 0,
        [HelpRequestStatus.CLOSED]: 0,
        [HelpRequestStatus.EXPIRED]: 0,
      };

      const byDistrict: Record<string, number> = {};
      const rationItems: Record<string, IRationItemInventorySummary> = {};

      // Process urgency groups (raw queries return model field names, not constants)
      (urgencyGroups as unknown as Array<Record<string, unknown>>).forEach(group => {
        const urgency = group.urgency as Urgency;
        const count = group.count as string | number;
        if (urgency && urgency in byUrgency) {
          byUrgency[urgency] = typeof count === 'string' ? parseInt(count, 10) : count;
        }
      });

      // Process status groups
      (statusGroups as unknown as Array<Record<string, unknown>>).forEach(group => {
        const status = group.status as HelpRequestStatus;
        const count = group.count as string | number;
        if (status && status in byStatus) {
          byStatus[status] = typeof count === 'string' ? parseInt(count, 10) : count;
        }
      });

      // Process district groups
      (districtGroups as unknown as Array<Record<string, unknown>>).forEach(group => {
        const approxArea = group.approxArea as string;
        const count = group.count as string | number;
        if (approxArea) {
          byDistrict[approxArea] = typeof count === 'string' ? parseInt(count, 10) : count;
        }
      });

      // Process people sums
      const peopleSumsData = peopleSums as Record<string, unknown> | null;
      const people = {
        totalPeople: peopleSumsData ? (typeof peopleSumsData.totalPeople === 'string' ? parseInt(peopleSumsData.totalPeople, 10) : Number(peopleSumsData.totalPeople || 0)) : 0,
        elders: peopleSumsData ? (typeof peopleSumsData.elders === 'string' ? parseInt(peopleSumsData.elders, 10) : Number(peopleSumsData.elders || 0)) : 0,
        children: peopleSumsData ? (typeof peopleSumsData.children === 'string' ? parseInt(peopleSumsData.children, 10) : Number(peopleSumsData.children || 0)) : 0,
        pets: peopleSumsData ? (typeof peopleSumsData.pets === 'string' ? parseInt(peopleSumsData.pets, 10) : Number(peopleSumsData.pets || 0)) : 0,
      };

      // Process inventory items (optimized database aggregation)
      (inventoryItemsData as unknown as Array<Record<string, unknown>>).forEach(item => {
        const itemName = item.itemName as string;
        const quantityNeeded = typeof item.totalQuantityNeeded === 'string' 
          ? parseInt(item.totalQuantityNeeded, 10) 
          : Number(item.totalQuantityNeeded || 0);
        const quantityDonated = typeof item.totalQuantityDonated === 'string'
          ? parseInt(item.totalQuantityDonated, 10)
          : Number(item.totalQuantityDonated || 0);
        const quantityPending = typeof item.totalQuantityPending === 'string'
          ? parseInt(item.totalQuantityPending, 10)
          : Number(item.totalQuantityPending || 0);
        const requestCount = typeof item.requestCount === 'string'
          ? parseInt(item.requestCount, 10)
          : Number(item.requestCount || 0);

        if (itemName) {
          rationItems[itemName] = {
            quantityNeeded,
            quantityDonated,
            quantityPending,
            quantityRemaining: Math.max(0, quantityNeeded - quantityDonated),
            requestCount,
          };
        }
      });

      return {
        total,
        byUrgency,
        byStatus,
        byDistrict,
        people,
        rationItems,
        totalRationItemTypes: Object.keys(rationItems).length, // Count of unique ration item types
      };
    } catch (error) {
      console.error('Error in HelpRequestDao.getSummary:', error);
      throw error;
    }
  }
}

export default HelpRequestDao;

