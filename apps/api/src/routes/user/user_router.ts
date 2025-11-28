import { BaseRouter } from '../common/base_router';
import { UserController } from '../../controllers';
import { UserService } from '../../services';
import { ValidationMiddleware, authenticate } from '../../middleware';
import { CreateUserDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/user/request';

// Route path constants
const USER_BASE_PATH = '/users'; // Full path: /api/users (api prefix added by RouterManager)

/**
 * Class-based router for User endpoints
 * Handles all user-related routes with proper validation and controller binding
 * 
 * Routes:
 * - POST   /api/users/register - Register a new user (no auth required)
 * - GET    /api/users/me       - Get current user profile (requires auth)
 * - GET    /api/users/:id      - Get user by ID
 */
export class UserRouter extends BaseRouter {
  private userController!: UserController;

  constructor() {
    // Call parent constructor first (this will call initializeRoutes)
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
   * Initialize all user routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getUserController();

    // POST /api/users/register - Register a new user (no auth required)
    this.router.post(
      '/register',
      ValidationMiddleware.body(CreateUserDto),
      controller.registerUser
    );

    // GET /api/users/me - Get current authenticated user's profile (requires auth)
    this.router.get(
      '/me',
      authenticate, // Authentication middleware - verifies token and sets req.user
      controller.getCurrentUser
    );

    // // GET /api/users/:id - Get user by ID
    // this.router.get(
    //   '/:id',
    //   controller.getUserById
    // );
  }

  /**
   * Get the base path for this router
   * @returns The base path for user routes
   */
  public getBasePath(): string {
    return USER_BASE_PATH;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    // Note: Full paths will be /api/users (api prefix added by RouterManager)
    return [
      { path: `${USER_BASE_PATH}/register`, methods: ['POST'] },
      { path: `${USER_BASE_PATH}/me`, methods: ['GET'] },
      { path: `${USER_BASE_PATH}/:id`, methods: ['GET'] }
    ];
  }

  /**
   * Get the user controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): UserController {
    return this.getUserController();
  }
}

