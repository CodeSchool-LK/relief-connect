import { AuditLogDao } from '../dao';
import { AuditAction } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { IAuditLog } from '../models/audit-log.model';
import { getClientIp, getUserAgent } from '../utils/audit.util';
import { Request } from 'express';
import { CreateAuditLogDto, AuditLogFiltersDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Service layer for Audit Logging
 */
class AuditLogService {
  private static instance: AuditLogService;
  private auditLogDao: AuditLogDao;

  private constructor(auditLogDao: AuditLogDao) {
    this.auditLogDao = auditLogDao;
  }

  public static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService(
        AuditLogDao.getInstance()
      );
    }
    return AuditLogService.instance;
  }

  /**
   * Log an audit action (with Request object)
   * Extracts IP address and user agent from the request
   */
  public async logAction(
    action: AuditAction,
    userId: number | undefined,
    req: Request,
    resourceType?: string,
    resourceId?: number | string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const auditLogDto = new CreateAuditLogDto({
        action,
        userId,
        resourceType,
        resourceId,
        details,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      await this.logActionWithDto(auditLogDto);
    } catch (error) {
      console.error('Error in AuditLogService.logAction:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log an audit action (without Request object - for service-level logging)
   * Use this when you have IP address and user agent separately
   */
  public async logActionWithMetadata(
    action: AuditAction,
    userId: number | undefined,
    ipAddress?: string,
    userAgent?: string,
    resourceType?: string,
    resourceId?: number | string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      const auditLogDto = new CreateAuditLogDto({
        action,
        userId,
        resourceType,
        resourceId,
        details,
        ipAddress,
        userAgent,
      });

      await this.logActionWithDto(auditLogDto);
    } catch (error) {
      console.error('Error in AuditLogService.logActionWithMetadata:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log an audit action using DTO
   * Internal method that handles the actual logging
   */
  private async logActionWithDto(auditLogDto: CreateAuditLogDto): Promise<void> {
    try {
      await this.auditLogDao.create({
        action: auditLogDto.action,
        userId: auditLogDto.userId,
        resourceType: auditLogDto.resourceType,
        resourceId: auditLogDto.resourceId,
        details: auditLogDto.details,
        ipAddress: auditLogDto.ipAddress,
        userAgent: auditLogDto.userAgent,
      });
    } catch (error) {
      console.error('Error in AuditLogService.logActionWithDto:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Get audit logs with filters
   */
  public async getAuditLogs(filters: AuditLogFiltersDto | ReturnType<AuditLogFiltersDto['toServiceFilters']>): Promise<IApiResponse<IAuditLog[]>> {
    try {
      // Convert DTO to service filters format if needed
      const serviceFilters = filters instanceof AuditLogFiltersDto ? filters.toServiceFilters() : filters;
      const logs = await this.auditLogDao.findWithFilters(serviceFilters);
      return {
        success: true,
        data: logs,
      };
    } catch (error) {
      console.error('Error in AuditLogService.getAuditLogs:', error);
      return {
        success: false,
        error: 'Failed to retrieve audit logs',
      };
    }
  }

  /**
   * Get audit log by ID
   */
  public async getAuditLogById(id: number): Promise<IApiResponse<IAuditLog>> {
    try {
      const log = await this.auditLogDao.findById(id);
      if (!log) {
        return {
          success: false,
          error: 'Audit log not found',
        };
      }
      return {
        success: true,
        data: log,
      };
    } catch (error) {
      console.error(`Error in AuditLogService.getAuditLogById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve audit log',
      };
    }
  }

  /**
   * Count audit logs with filters
   * Note: Pagination attributes (limit, offset) are ignored in count operations
   */
  public async countAuditLogs(filters: AuditLogFiltersDto | ReturnType<AuditLogFiltersDto['toServiceFilters']>): Promise<IApiResponse<number>> {
    try {
      // Convert DTO to service filters format if needed
      const serviceFilters = filters instanceof AuditLogFiltersDto ? filters.toServiceFilters() : filters;
      const count = await this.auditLogDao.countWithFilters(serviceFilters);
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      console.error('Error in AuditLogService.countAuditLogs:', error);
      return {
        success: false,
        error: 'Failed to count audit logs',
      };
    }
  }
}

export default AuditLogService;
export { AuditLogService };

