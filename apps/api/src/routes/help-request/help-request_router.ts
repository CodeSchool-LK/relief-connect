import { BaseRouter } from '../common/base_router';
import { HelpRequestController } from '../../controllers';
import { HelpRequestService } from '../../services';
import { ValidationMiddleware } from '../../middleware';
import { CreateHelpRequestDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/request';

// Route path constants
const HELP_REQUEST_BASE_PATH = '/help-requests'; // Full path: /api/help-requests (api prefix added by RouterManager)

/**
 * Class-based router for HelpRequest endpoints
 * Handles all help request-related routes with proper validation and controller binding
 * 
 * Routes:
 * - GET    /api/help-requests     - Get all help requests (with optional filters)
 * - POST   /api/help-requests     - Create new help request
 */
export class HelpRequestRouter extends BaseRouter {
  private helpRequestController!: HelpRequestController;

  constructor() {
    // Call parent constructor first (this will call initializeRoutes)
    super();
  }

  /**
   * Get or create the help request controller instance (lazy initialization)
   */
  private getHelpRequestController(): HelpRequestController {
    if (!this.helpRequestController) {
      const helpRequestService = HelpRequestService.getInstance();
      this.helpRequestController = new HelpRequestController(helpRequestService);
    }
    return this.helpRequestController;
  }

  /**
   * Initialize all help request routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getHelpRequestController();

    // GET /api/help-requests - Get all help requests (with optional filters)
    this.router.get(
      '/',
      controller.getHelpRequests
    );

    // POST /api/help-requests - Create new help request
    this.router.post(
      '/',
      ValidationMiddleware.body(CreateHelpRequestDto),
      controller.createHelpRequest
    );
  }

  /**
   * Get the base path for this router
   * @returns The base path for help request routes
   */
  public getBasePath(): string {
    return HELP_REQUEST_BASE_PATH;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    // Note: Full paths will be /api/help-requests (api prefix added by RouterManager)
    return [
      { path: HELP_REQUEST_BASE_PATH, methods: ['GET', 'POST'] }
    ];
  }

  /**
   * Get the help request controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): HelpRequestController {
    return this.getHelpRequestController();
  }
}

