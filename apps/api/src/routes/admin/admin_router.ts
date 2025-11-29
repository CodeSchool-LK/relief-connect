import { BaseRouter } from '../common/base_router';
import { UserController } from '../../controllers';
import { UserService } from '../../services';
import { ValidationMiddleware } from '../../middleware';
import { validateApiKey } from '../../middleware/apiKeyAuth';
import { CreateAdminDto, CreateVolunteerClubUserDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { requireAdmin } from '../../middleware/authorization';
import { authenticate } from '../../middleware/authentication';

// Route path constants
const ADMIN_BASE_PATH = '/admin';

/**
 * Class-based router for Admin endpoints
 * Handles one-time admin creation and admin-only operations
 */
export class AdminRouter extends BaseRouter {
  private userController!: UserController;

  constructor() {
    super();
  }

  /**
   * Get or create the user controller instance (lazy initialization)
   */
  private getUserController(): UserController {
    if (!this.userController) {
      const userService = UserService.getInstance();
      this.userController = new UserController(userService);
    }
    return this.userController;
  }

  /**
   * Initialize all admin routes
   */
  protected initializeRoutes(): void {
    const controller = this.getUserController();

    // POST /api/admin/create-admin - Create initial admin account (one-time, requires API key)
    this.router.post(
      '/create-admin',
      ValidationMiddleware.body(CreateAdminDto),
      validateApiKey,
      controller.createAdminAccount
    );

    // POST /api/admin/volunteer-club-users - Create volunteer club user (admin only)
    this.router.post(
      '/volunteer-club-users',
      authenticate,
      requireAdmin(),
      ValidationMiddleware.body(CreateVolunteerClubUserDto),
      controller.createVolunteerClubUser
    );
  }

  /**
   * Get the base path for this router
   */
  public getBasePath(): string {
    return ADMIN_BASE_PATH;
  }

  /**
   * Get route information for this router
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: `${ADMIN_BASE_PATH}/create-admin`, methods: ['POST'] },
      { path: `${ADMIN_BASE_PATH}/volunteer-club-users`, methods: ['POST'] },
    ];
  }
}

