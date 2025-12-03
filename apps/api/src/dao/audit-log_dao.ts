import AuditLogModel, { IAuditLog } from '../models/audit-log.model';
import { Op } from 'sequelize';
import { AuditLogFiltersDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Service layer filter format for audit logs
 * This matches the return type of AuditLogFiltersDto.toServiceFilters()
 */
type AuditLogServiceFilters = ReturnType<AuditLogFiltersDto['toServiceFilters']>;

class AuditLogDao {
  private static instance: AuditLogDao;

  private constructor() {}

  public static getInstance(): AuditLogDao {
    if (!AuditLogDao.instance) {
      AuditLogDao.instance = new AuditLogDao();
    }
    return AuditLogDao.instance;
  }

  /**
   * Create a new audit log entry
   */
  public async create(logData: Omit<IAuditLog, 'id' | 'createdAt'>): Promise<IAuditLog> {
    try {
      const log = await AuditLogModel.create(logData);
      return log.toJSON() as IAuditLog;
    } catch (error) {
      console.error('Error in AuditLogDao.create:', error);
      throw error;
    }
  }

  /**
   * Find audit log by ID
   */
  public async findById(id: number): Promise<IAuditLog | null> {
    try {
      const log = await AuditLogModel.findByPk(id);
      return log ? (log.toJSON() as IAuditLog) : null;
    } catch (error) {
      console.error(`Error in AuditLogDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Find audit logs with filters
   */
  public async findWithFilters(filters: AuditLogServiceFilters): Promise<IAuditLog[]> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId !== undefined) {
        where[AuditLogModel.LOG_USER_ID] = filters.userId;
      }

      if (filters.action) {
        where[AuditLogModel.LOG_ACTION] = filters.action;
      }

      if (filters.resourceType) {
        where[AuditLogModel.LOG_RESOURCE_TYPE] = filters.resourceType;
      }

      if (filters.resourceId !== undefined) {
        where[AuditLogModel.LOG_RESOURCE_ID] = String(filters.resourceId);
      }

      if (filters.startDate || filters.endDate) {
        const dateFilter: {
          [Op.gte]?: Date;
          [Op.lte]?: Date;
        } = {};
        if (filters.startDate) {
          dateFilter[Op.gte] = filters.startDate;
        }
        if (filters.endDate) {
          dateFilter[Op.lte] = filters.endDate;
        }
        where[AuditLogModel.LOG_CREATED_AT] = dateFilter;
      }

      const queryOptions: {
        where: Record<string, unknown>;
        order: Array<[string, string]>;
        limit?: number;
        offset?: number;
      } = {
        where,
        order: [['createdAt', 'DESC']],
      };

      if (filters.limit !== undefined) {
        queryOptions.limit = filters.limit;
      }

      if (filters.offset !== undefined) {
        queryOptions.offset = filters.offset;
      }

      const logs = await AuditLogModel.findAll(queryOptions);
      return logs.map(log => log.toJSON() as IAuditLog);
    } catch (error) {
      console.error('Error in AuditLogDao.findWithFilters:', error);
      throw error;
    }
  }

  /**
   * Count audit logs with filters
   * Note: Pagination attributes (limit, offset) are ignored in count operations
   */
  public async countWithFilters(filters: AuditLogServiceFilters): Promise<number> {
    try {
      const where: Record<string, unknown> = {};

      if (filters.userId !== undefined) {
        where[AuditLogModel.LOG_USER_ID] = filters.userId;
      }

      if (filters.action) {
        where[AuditLogModel.LOG_ACTION] = filters.action;
      }

      if (filters.resourceType) {
        where[AuditLogModel.LOG_RESOURCE_TYPE] = filters.resourceType;
      }

      if (filters.resourceId !== undefined) {
        where[AuditLogModel.LOG_RESOURCE_ID] = String(filters.resourceId);
      }

      if (filters.startDate || filters.endDate) {
        const dateFilter: {
          [Op.gte]?: Date;
          [Op.lte]?: Date;
        } = {};
        if (filters.startDate) {
          dateFilter[Op.gte] = filters.startDate;
        }
        if (filters.endDate) {
          dateFilter[Op.lte] = filters.endDate;
        }
        where[AuditLogModel.LOG_CREATED_AT] = dateFilter;
      }

      return await AuditLogModel.count({ where });
    } catch (error) {
      console.error('Error in AuditLogDao.countWithFilters:', error);
      throw error;
    }
  }
}

export default AuditLogDao;
export { AuditLogDao };

