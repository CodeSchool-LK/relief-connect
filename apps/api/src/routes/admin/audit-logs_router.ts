import { BaseRouter } from '../common/base_router';
import { AuditLogController } from '../../controllers';
import { AuditLogService } from '../../services';
import { ValidationMiddleware, authenticate, requireAdmin } from '../../middleware';
import { requirePermission} from '../../middleware/permission';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IdParamDto, AuditLogFiltersDto, ExportAuditLogsDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

const AUDIT_LOGS_BASE_PATH = '/admin/audit-logs';

/**
 * Router for Audit Log endpoints
 */
export class AuditLogsRouter extends BaseRouter {
  private auditLogController!: AuditLogController;

  constructor() {
    super();
  }

  private getAuditLogController(): AuditLogController {
    if (!this.auditLogController) {
      const auditLogService = AuditLogService.getInstance();
      this.auditLogController = new AuditLogController(auditLogService);
    }
    return this.auditLogController;
  }

  protected initializeRoutes(): void {
    const controller = this.getAuditLogController();

    // GET /api/admin/audit-logs - Get audit logs with filters
    this.router.get(
      '/',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.VIEW_AUDIT_LOGS),
      ValidationMiddleware.query(AuditLogFiltersDto),
      controller.getAuditLogs
    );

    // GET /api/admin/audit-logs/:id - Get audit log by ID
    this.router.get(
      '/:id',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.VIEW_AUDIT_LOGS),
      ValidationMiddleware.params(IdParamDto),
      controller.getAuditLogById
    );

    // GET /api/admin/audit-logs/export - Export audit logs
    // Requires startDate and endDate query parameters to filter by time period
    this.router.get(
      '/export',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.EXPORT_AUDIT_LOGS),
      ValidationMiddleware.query(ExportAuditLogsDto),
      controller.exportAuditLogs
    );
  }

  public getBasePath(): string {
    return AUDIT_LOGS_BASE_PATH;
  }

  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: `${AUDIT_LOGS_BASE_PATH}`, methods: ['GET'] },
      { path: `${AUDIT_LOGS_BASE_PATH}/:id`, methods: ['GET'] },
      { path: `${AUDIT_LOGS_BASE_PATH}/export`, methods: ['GET'] },
    ];
  }
}

