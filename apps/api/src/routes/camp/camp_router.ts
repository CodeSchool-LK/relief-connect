import { BaseRouter } from '../common/base_router';
import { CampController } from '../../controllers';
import { CampService } from '../../services';
import { ValidationMiddleware, authenticate, requireVolunteerClub, requireAuthenticated } from '../../middleware';
import { CreateCampDto, UpdateCampDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/request';

// Route path constants
const CAMP_BASE_PATH = '/camps'; // Full path: /api/camps (api prefix added by RouterManager)

/**
 * Class-based router for Camp endpoints
 * Handles all camp-related routes with proper validation and controller binding
 * 
 * Routes:
 * - GET    /api/camps     - Get all camps (with optional filters)
 * - GET    /api/camps/:id - Get a single camp by ID
 * - PUT    /api/camps/:id - Update an existing camp
 * - POST   /api/camps     - Create new camp
 */
export class CampRouter extends BaseRouter {
  private campController!: CampController;

  constructor() {
    // Call parent constructor first (this will call initializeRoutes)
    super();
  }

  /**
   * Get or create the camp controller instance (lazy initialization)
   */
  private getCampController(): CampController {
    if (!this.campController) {
      const campService = CampService.getInstance();
      this.campController = new CampController(campService);
    }
    return this.campController;
  }

  /**
   * Initialize all camp routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getCampController();

    // GET /api/camps - Get all camps (with optional filters)
    this.router.get(
      '/',
      controller.getCamps
    );

    // GET /api/camps/:id - Get a single camp by ID (requires authentication - only accessible by admins or owning volunteer club)
    this.router.get(
      '/:id',
      authenticate,
      requireAuthenticated(),
      controller.getCampById
    );

    // PUT /api/camps/:id - Update an existing camp (requires authentication - only accessible by admins or owning volunteer club)
    this.router.put(
      '/:id',
      authenticate,
      requireAuthenticated(),
      ValidationMiddleware.body(UpdateCampDto),
      controller.updateCamp
    );

    // POST /api/camps - Create new camp (volunteer club only)
    this.router.post(
      '/',
      authenticate,
      requireVolunteerClub(),
      ValidationMiddleware.body(CreateCampDto),
      controller.createCamp
    );
  }

  /**
   * Get the base path for this router
   * @returns The base path for camp routes
   */
  public getBasePath(): string {
    return CAMP_BASE_PATH;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    // Note: Full paths will be /api/camps (api prefix added by RouterManager)
    return [
      { path: CAMP_BASE_PATH, methods: ['GET', 'POST'] },
      { path: `${CAMP_BASE_PATH}/:id`, methods: ['GET', 'PUT'] }
    ];
  }

  /**
   * Get the camp controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): CampController {
    return this.getCampController();
  }
}

