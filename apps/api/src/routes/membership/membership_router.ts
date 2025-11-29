import { BaseRouter } from '../common/base_router';
import { MembershipController } from '../../controllers';
import { MembershipService } from '../../services';
import { VolunteerClubDao } from '../../dao';
import { ValidationMiddleware, authenticate, requireAuthenticated, requireAdminOrVolunteerClub } from '../../middleware';
import { RequestMembershipDto, ReviewMembershipDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { IdParamDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

// Route path constants
const MEMBERSHIP_BASE_PATH = '/memberships'; // Full path: /api/memberships (api prefix added by RouterManager)

/**
 * Class-based router for Membership endpoints
 * Handles all membership-related routes with proper validation and controller binding
 * 
 * Routes:
 * - POST   /api/memberships/request      - Request to join club (authenticated users)
 * - GET    /api/memberships/me           - Get my memberships (authenticated users)
 * - GET    /api/memberships/club/:clubId - Get club memberships (club admins or system admins)
 * - GET    /api/memberships/:id          - Get membership by ID (user, club admin, or system admin)
 * - PUT    /api/memberships/:id/review   - Approve/reject membership (club admins or system admins)
 * - DELETE /api/memberships/:id         - Cancel membership request (user who requested)
 */
export class MembershipRouter extends BaseRouter {
  private membershipController!: MembershipController;

  constructor() {
    super();
  }

  /**
   * Get or create the membership controller instance (lazy initialization)
   */
  private getMembershipController(): MembershipController {
    if (!this.membershipController) {
      const membershipService = MembershipService.getInstance();
      const volunteerClubDao = VolunteerClubDao.getInstance();
      this.membershipController = new MembershipController(membershipService, volunteerClubDao);
    }
    return this.membershipController;
  }

  /**
   * Initialize all membership routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getMembershipController();

    // POST /api/memberships/request - Request to join club (authenticated users)
    this.router.post(
      '/request',
      authenticate,
      requireAuthenticated(),
      ValidationMiddleware.body(RequestMembershipDto),
      controller.requestMembership
    );

    // GET /api/memberships/me - Get my memberships (authenticated users)
    this.router.get(
      '/me',
      authenticate,
      requireAuthenticated(),
      controller.getMyMemberships
    );

    // GET /api/memberships/club/:clubId - Get club memberships (club admins or system admins)
    this.router.get(
      '/club/:clubId',
      authenticate,
      requireAdminOrVolunteerClub(),
      controller.getClubMemberships
    );

    // GET /api/memberships/:id - Get membership by ID (user, club admin, or system admin)
    this.router.get(
      '/:id',
      authenticate,
      requireAuthenticated(),
      ValidationMiddleware.params(IdParamDto),
      controller.getMembershipById
    );

    // PUT /api/memberships/:id/review - Approve/reject membership (club admins or system admins)
    this.router.put(
      '/:id/review',
      authenticate,
      requireAdminOrVolunteerClub(),
      ValidationMiddleware.params(IdParamDto),
      ValidationMiddleware.body(ReviewMembershipDto),
      controller.reviewMembership
    );

    // DELETE /api/memberships/:id - Cancel membership request (user who requested)
    this.router.delete(
      '/:id',
      authenticate,
      requireAuthenticated(),
      ValidationMiddleware.params(IdParamDto),
      controller.cancelMembership
    );
  }

  /**
   * Get the base path for this router
   */
  public getBasePath(): string {
    return MEMBERSHIP_BASE_PATH;
  }

  /**
   * Get route information for this router
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: `${MEMBERSHIP_BASE_PATH}/request`, methods: ['POST'] },
      { path: `${MEMBERSHIP_BASE_PATH}/me`, methods: ['GET'] },
      { path: `${MEMBERSHIP_BASE_PATH}/club/:clubId`, methods: ['GET'] },
      { path: `${MEMBERSHIP_BASE_PATH}/:id`, methods: ['GET', 'DELETE'] },
      { path: `${MEMBERSHIP_BASE_PATH}/:id/review`, methods: ['PUT'] },
    ];
  }
}

