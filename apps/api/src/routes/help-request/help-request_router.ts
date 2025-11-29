import { BaseRouter } from '../common/base_router';
import { HelpRequestController, DonationController } from '../../controllers';
import { HelpRequestService, DonationService } from '../../services';
import { ValidationMiddleware, authenticate } from '../../middleware';
import { CreateHelpRequestDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/request';
import { CreateDonationDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/donation/request';

// Route path constants
const HELP_REQUEST_BASE_PATH = '/help-requests'; // Full path: /api/help-requests (api prefix added by RouterManager)

/**
 * Class-based router for HelpRequest endpoints
 * Handles all help request-related routes with proper validation and controller binding
 * 
 * Routes:
 * - GET    /api/help-requests/summary - Get comprehensive summary statistics
 * - GET    /api/help-requests     - Get all help requests (with optional filters)
 * - GET    /api/help-requests/:id - Get a single help request by ID
 * - POST   /api/help-requests     - Create new help request (requires authentication)
 */
export class HelpRequestRouter extends BaseRouter {
  private helpRequestController!: HelpRequestController;
  private donationController!: DonationController;

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
   * Initialize all help request routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getHelpRequestController();
    const donationController = this.getDonationController();

    // GET /api/help-requests/summary - Get comprehensive summary statistics
    this.router.get(
      '/summary',
      controller.getHelpRequestsSummary
    );

    // GET /api/help-requests/my - Get authenticated user's help requests
    this.router.get(
      '/my',
      authenticate,
      controller.getMyHelpRequests
    );

    // GET /api/help-requests - Get all help requests (with optional filters)
    this.router.get(
      '/',
      authenticate,
      controller.getHelpRequests
    );

    // GET /api/help-requests/:id/inventory - Get inventory items for a help request
    // Must come before /:id route to avoid route matching conflicts
    this.router.get(
      '/:id/inventory',
      authenticate,
      controller.getInventoryItems
    );

    // GET /api/help-requests/:id - Get a single help request by ID
    this.router.get(
      '/:id',
      authenticate,
      controller.getHelpRequestById
    );

    // POST /api/help-requests - Create new help request (requires authentication)
    this.router.post(
      '/',
      authenticate, // Authentication middleware - verifies token and sets req.user
      ValidationMiddleware.body(CreateHelpRequestDto),
      controller.createHelpRequest
    );

    // Donation routes (nested under help requests)
    // GET /api/help-requests/my/donations - Get authenticated user's donations (must come before /:helpRequestId/donations)
    this.router.get(
      '/my/donations',
      authenticate,
      donationController.getMyDonations
    );

    // GET /api/help-requests/:helpRequestId/donations - Get all donations for a help request
    this.router.get(
      '/:helpRequestId/donations',
      authenticate,
      donationController.getDonationsByHelpRequestId
    );

    // POST /api/help-requests/:helpRequestId/donations - Create a new donation (requires authentication)
    this.router.post(
      '/:helpRequestId/donations',
      authenticate,
      ValidationMiddleware.body(CreateDonationDto),
      donationController.createDonation
    );

    // PATCH /api/help-requests/:helpRequestId/donations/:donationId/schedule - Mark donation as scheduled by donator
    this.router.patch(
      '/:helpRequestId/donations/:donationId/schedule',
      authenticate,
      donationController.markAsScheduled
    );

    // PATCH /api/help-requests/:helpRequestId/donations/:donationId/complete-donator - Mark donation as completed by donator
    this.router.patch(
      '/:helpRequestId/donations/:donationId/complete-donator',
      authenticate,
      donationController.markAsCompletedByDonator
    );

    // PATCH /api/help-requests/:helpRequestId/donations/:donationId/complete-owner - Mark donation as completed by owner
    this.router.patch(
      '/:helpRequestId/donations/:donationId/complete-owner',
      authenticate,
      donationController.markAsCompletedByOwner
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
      { path: `${HELP_REQUEST_BASE_PATH}/summary`, methods: ['GET'] },
      { path: HELP_REQUEST_BASE_PATH, methods: ['GET', 'POST'] },
      { path: `${HELP_REQUEST_BASE_PATH}/:id`, methods: ['GET'] },
      { path: `${HELP_REQUEST_BASE_PATH}/:id/inventory`, methods: ['GET'] },
      { path: `${HELP_REQUEST_BASE_PATH}/:helpRequestId/donations`, methods: ['GET', 'POST'] },
      { path: `${HELP_REQUEST_BASE_PATH}/:helpRequestId/donations/:donationId/schedule`, methods: ['PATCH'] },
      { path: `${HELP_REQUEST_BASE_PATH}/:helpRequestId/donations/:donationId/complete-donator`, methods: ['PATCH'] },
      { path: `${HELP_REQUEST_BASE_PATH}/:helpRequestId/donations/:donationId/complete-owner`, methods: ['PATCH'] }
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

