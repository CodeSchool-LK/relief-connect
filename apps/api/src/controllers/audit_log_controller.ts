import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services';
import { IAuditLog } from '../models/audit-log.model';
import { AuditLogFiltersDto, ExportAuditLogsDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Controller for Audit Log endpoints
 */
class AuditLogController {
  private auditLogService: AuditLogService;

  constructor(auditLogService: AuditLogService) {
    this.auditLogService = auditLogService;
  }

  /**
   * GET /api/admin/audit-logs
   * Get audit logs with filters
   * Note: req.query is validated by AuditLogFiltersDto middleware
   */
  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get validated filters from DTO
      const filtersDto = req.query as unknown as AuditLogFiltersDto;
      const filters = filtersDto.toServiceFilters();

      const result = await this.auditLogService.getAuditLogs(filters);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Audit logs retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve audit logs', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/audit-logs/:id
   * Get audit log by ID
   */
  getAuditLogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.sendError('Invalid audit log ID', 400);
        return;
      }

      const result = await this.auditLogService.getAuditLogById(id);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Audit log retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Audit log not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/audit-logs/export
   * Export audit logs (CSV/JSON)
   * Requires startDate and endDate to filter by specific time period
   * Note: req.query is validated by ExportAuditLogsDto middleware
   */
  exportAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get validated filters from DTO (requires startDate and endDate)
      const exportDto = req.query as unknown as ExportAuditLogsDto;
      
      // Validate time period (endDate must be after startDate, and period cannot exceed 365 days)
      try {
        exportDto.validateDateRange();
      } catch (error) {
        res.sendError(error instanceof Error ? error.message : 'Invalid date range', 400);
        return;
      }
      
      const format = exportDto.format || 'json';
      const filters = exportDto.toServiceFilters();
      
      const result = await this.auditLogService.getAuditLogs(filters);

      if (!result.success || !result.data) {
        res.sendError(result.error || 'Failed to retrieve audit logs', 500);
        return;
      }

      if (format === 'csv') {
        // Convert to CSV
        const csv = this.convertToCSV(result.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.send(csv);
      } else {
        // Return JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');
        res.json(result.data);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Convert audit logs to CSV format
   */
  private convertToCSV(logs: IAuditLog[]): string {
    const headers = ['ID', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'User Agent', 'Created At'];
    const rows = logs.map(log => [
      log.id || '',
      log.userId || '',
      log.action,
      log.resourceType || '',
      log.resourceId || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.createdAt ? new Date(log.createdAt).toISOString() : '',
    ]);

    return [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
  }
}

export default AuditLogController;
export { AuditLogController };

