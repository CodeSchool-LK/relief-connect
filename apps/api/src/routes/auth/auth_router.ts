import { BaseRouter } from '../common/base_router';
import { AuthController } from '../../controllers';
import { AuthService } from '../../services';
import { ValidationMiddleware } from '../../middleware';
import { LoginDto, RefreshTokenDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

// Route path constants
const AUTH_BASE_PATH = '/auth'; // Full path: /api/auth (api prefix added by RouterManager)

/**
 * Class-based router for Auth endpoints
 * Handles all authentication-related routes with proper validation and controller binding
 * 
 * Routes:
 * - POST   /api/auth/login - Login user with username and optional password
 * - POST   /api/auth/refresh - Refresh access token using refresh token
 */
export class AuthRouter extends BaseRouter {
  private authController!: AuthController;

  constructor() {
    // Call parent constructor first (this will call initializeRoutes)
    super();
  }

  /**
   * Get or create the auth controller instance (lazy initialization)
   */
  private getAuthController(): AuthController {
    if (!this.authController) {
      const authService = AuthService.getInstance();
      this.authController = new AuthController(authService);
    }
    return this.authController;
  }

  /**
   * Initialize all auth routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getAuthController();

    // POST /api/auth/login - Login user
    this.router.post(
      '/login',
      ValidationMiddleware.body(LoginDto),
      controller.login
    );

    // POST /api/auth/refresh - Refresh access token
    this.router.post(
      '/refresh',
      ValidationMiddleware.body(RefreshTokenDto),
      controller.refreshToken
    );
  }

  /**
   * Get the base path for this router
   * @returns The base path for auth routes
   */
  public getBasePath(): string {
    return AUTH_BASE_PATH;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    // Note: Full paths will be /api/auth (api prefix added by RouterManager)
    return [
      { path: `${AUTH_BASE_PATH}/login`, methods: ['POST'] },
      { path: `${AUTH_BASE_PATH}/refresh`, methods: ['POST'] }
    ];
  }

  /**
   * Get the auth controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): AuthController {
    return this.getAuthController();
  }
}

