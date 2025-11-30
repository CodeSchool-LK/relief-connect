import { BaseRouter } from '../common/base_router';
import { VolunteerClubController } from '../../controllers';
import { VolunteerClubService } from '../../services';
import { ValidationMiddleware, authenticate, requireAdmin, requireVolunteerClub, requireAuthenticated } from '../../middleware';
import { CreateVolunteerClubDto, UpdateVolunteerClubDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { IdParamDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

// Route path constants
const VOLUNTEER_CLUB_BASE_PATH = '/volunteer-clubs'; // Full path: /api/volunteer-clubs (api prefix added by RouterManager)

/**
 * Class-based router for Volunteer Club endpoints
 * Handles all volunteer club-related routes with proper validation and controller binding
 * 
 * Routes:
 * - POST   /api/volunteer-clubs        - Create a new volunteer club (admin only)
 * - GET    /api/volunteer-clubs        - List all volunteer clubs (all authenticated users)
 * - GET    /api/volunteer-clubs/:id   - Get volunteer club by ID (all authenticated users)
 * - PUT    /api/volunteer-clubs/:id   - Update volunteer club (admin only)
 * - DELETE /api/volunteer-clubs/:id   - Delete volunteer club (admin only)
 * - GET    /api/volunteer-clubs/me    - Get my club (volunteer club only)
 */
export class VolunteerClubRouter extends BaseRouter {
  private volunteerClubController!: VolunteerClubController;

  constructor() {
    super();
  }

  /**
   * Get or create the volunteer club controller instance (lazy initialization)
   */
  private getVolunteerClubController(): VolunteerClubController {
    if (!this.volunteerClubController) {
      const volunteerClubService = VolunteerClubService.getInstance();
      this.volunteerClubController = new VolunteerClubController(volunteerClubService);
    }
    return this.volunteerClubController;
  }

  /**
   * Initialize all volunteer club routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getVolunteerClubController();

    // POST /api/volunteer-clubs - Create (admin only)
    this.router.post(
      '/',
      authenticate,
      requireAdmin(),
      ValidationMiddleware.body(CreateVolunteerClubDto),
      controller.create
    );

    // GET /api/volunteer-clubs - List all (public - for viewing clubs and drop-off locations)
    this.router.get(
      '/',
      controller.getAll
    );

    // GET /api/volunteer-clubs/me - Get my club (volunteer club only)
    this.router.get(
      '/me',
      authenticate,
      requireVolunteerClub(),
      controller.getMyClub
    );

    // GET /api/volunteer-clubs/:id - Get by ID (public - for viewing club details)
    this.router.get(
      '/:id',
      ValidationMiddleware.params(IdParamDto),
      controller.getById
    );

    // PUT /api/volunteer-clubs/:id - Update (admin only)
    this.router.put(
      '/:id',
      authenticate,
      requireAdmin(),
      ValidationMiddleware.params(IdParamDto),
      ValidationMiddleware.body(UpdateVolunteerClubDto),
      controller.update
    );

    // DELETE /api/volunteer-clubs/:id - Delete (admin only)
    this.router.delete(
      '/:id',
      authenticate,
      requireAdmin(),
      ValidationMiddleware.params(IdParamDto),
      controller.delete
    );
  }

  /**
   * Get the base path for this router
   */
  public getBasePath(): string {
    return VOLUNTEER_CLUB_BASE_PATH;
  }

  /**
   * Get route information for this router
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: `${VOLUNTEER_CLUB_BASE_PATH}`, methods: ['POST', 'GET'] },
      { path: `${VOLUNTEER_CLUB_BASE_PATH}/me`, methods: ['GET'] },
      { path: `${VOLUNTEER_CLUB_BASE_PATH}/:id`, methods: ['GET', 'PUT', 'DELETE'] },
    ];
  }
}

