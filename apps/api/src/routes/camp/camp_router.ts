import { BaseRouter } from '../common/base_router';
import { CampController } from '../../controllers';
import { DonationController } from '../../controllers';
import { DonationService } from '../../services';
import { CampService } from '../../services';
import { ValidationMiddleware, authenticate, requireVolunteerClub, requireAuthenticated, requireAdminOrVolunteerClub } from '../../middleware';
import { CreateCampDto, UpdateCampDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/camp/request';
import { CreateCampDonationDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/request/create_camp_donation_dto';

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
  private donationController!: DonationController;

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
   * Get or create the donation controller instance (lazy initialization)
   */
  private getDonationController(): DonationController {
    if (!this.donationController) {
      const donationService = DonationService.getInstance();
      this.donationController = new DonationController(donationService);
    }
    return this.donationController;
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

    // GET /api/camps/drop-off-locations - Get all drop-off locations for active camps
    this.router.get(
      '/drop-off-locations',
      controller.getAllDropOffLocations
    );

    // GET /api/camps/:id - Get a single camp by ID (requires authentication - only accessible by admins or owning volunteer club)
    this.router.get(
      '/:id',
      authenticate,
      requireAuthenticated(),
      controller.getCampById
    );

    // GET /api/camps/:id/inventory - Get inventory items for a camp
    this.router.get(
      '/:id/inventory',
      authenticate,
      requireAuthenticated(),
      controller.getCampInventoryItems
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

    // Camp donation routes (nested under camps)
    const donationController = this.getDonationController();

    // GET /api/camps/:campId/donations - Get all donations for a camp
    this.router.get(
      '/:campId/donations',
      authenticate,
      requireAuthenticated(),
      donationController.getDonationsByCampId
    );

    // POST /api/camps/:campId/donations - Create a new donation for a camp (requires authentication)
    this.router.post(
      '/:campId/donations',
      authenticate,
      requireAuthenticated(),
      ValidationMiddleware.body(CreateCampDonationDto),
      donationController.createCampDonation
    );

    // PUT /api/camps/:campId/donations/:donationId/accept - Accept a camp donation (club admin only)
    this.router.put(
      '/:campId/donations/:donationId/accept',
      authenticate,
      requireAdminOrVolunteerClub(),
      donationController.acceptCampDonation
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
      { path: `${CAMP_BASE_PATH}/drop-off-locations`, methods: ['GET'] },
      { path: `${CAMP_BASE_PATH}/:id`, methods: ['GET', 'PUT'] },
      { path: `${CAMP_BASE_PATH}/:id/inventory`, methods: ['GET'] },
      { path: `${CAMP_BASE_PATH}/:campId/donations`, methods: ['GET', 'POST'] },
      { path: `${CAMP_BASE_PATH}/:campId/donations/:donationId/accept`, methods: ['PUT'] }
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

