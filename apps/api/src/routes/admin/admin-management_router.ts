import { BaseRouter } from '../common/base_router';
import { AdminManagementController } from '../../controllers';
import { AdminManagementService } from '../../services';
import { ValidationMiddleware, authenticate, requireAdmin } from '../../middleware';
import { requirePermission } from '../../middleware/permission';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { 
  CreateSystemAdminDto, 
  UpdateSystemAdminDto, 
  UpdatePermissionsDto,
  IdParamDto,
  PaginationDto
} from '@nx-mono-repo-deployment-test/shared/src/dtos';

// Route path constants
const ADMIN_MANAGEMENT_BASE_PATH = '/admin/system-administrators';

/**
 * Class-based router for System Administrator Management endpoints
 * Handles all system administrator management routes with proper validation and authorization
 */
export class AdminManagementRouter extends BaseRouter {
  private adminManagementController!: AdminManagementController;

  constructor() {
    super();
  }

  /**
   * Get or create the admin management controller instance (lazy initialization)
   */
  private getAdminManagementController(): AdminManagementController {
    if (!this.adminManagementController) {
      const adminManagementService = AdminManagementService.getInstance();
      this.adminManagementController = new AdminManagementController(adminManagementService);
    }
    return this.adminManagementController;
  }

  /**
   * Initialize all admin management routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getAdminManagementController();

    // GET /api/admin/system-administrators - List all system administrators
    this.router.get(
      '/',
      authenticate,
      requireAdmin(), // Requires SYSTEM_ADMINISTRATOR or ADMIN role
      ValidationMiddleware.query(PaginationDto),
      controller.getAllSystemAdmins
    );

    // GET /api/admin/system-administrators/:id - Get system administrator by ID
    this.router.get(
      '/:id',
      authenticate,
      requireAdmin(),
      ValidationMiddleware.params(IdParamDto),
      controller.getSystemAdminById
    );

    // POST /api/admin/system-administrators - Create system administrator
    this.router.post(
      '/',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_ADMINS),
      ValidationMiddleware.body(CreateSystemAdminDto),
      controller.createSystemAdmin
    );

    // PUT /api/admin/system-administrators/:id - Update system administrator
    this.router.put(
      '/:id',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_ADMINS),
      ValidationMiddleware.params(IdParamDto),
      ValidationMiddleware.body(UpdateSystemAdminDto),
      controller.updateSystemAdmin
    );

    // PUT /api/admin/system-administrators/:id/permissions - Update permissions
    this.router.put(
      '/:id/permissions',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.ASSIGN_PERMISSIONS),
      ValidationMiddleware.params(IdParamDto),
      ValidationMiddleware.body(UpdatePermissionsDto),
      controller.updatePermissions
    );

    // PUT /api/admin/system-administrators/:id/status - Update status
    this.router.put(
      '/:id/status',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_ADMINS),
      ValidationMiddleware.params(IdParamDto),
      controller.updateStatus
    );

    // DELETE /api/admin/system-administrators/:id - Delete system administrator
    this.router.delete(
      '/:id',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_ADMINS),
      ValidationMiddleware.params(IdParamDto),
      controller.deleteSystemAdmin
    );
  }

  /**
   * Get the base path for this router
   */
  public getBasePath(): string {
    return ADMIN_MANAGEMENT_BASE_PATH;
  }

  /**
   * Get route information for this router
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: `${ADMIN_MANAGEMENT_BASE_PATH}`, methods: ['GET', 'POST'] },
      { path: `${ADMIN_MANAGEMENT_BASE_PATH}/:id`, methods: ['GET', 'PUT', 'DELETE'] },
      { path: `${ADMIN_MANAGEMENT_BASE_PATH}/:id/permissions`, methods: ['PUT'] },
      { path: `${ADMIN_MANAGEMENT_BASE_PATH}/:id/status`, methods: ['PUT'] },
    ];
  }
}

