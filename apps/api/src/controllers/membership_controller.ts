import { Request, Response, NextFunction } from 'express';
import { MembershipService } from '../services';
import { VolunteerClubDao } from '../dao';
import { RequestMembershipDto, ReviewMembershipDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { IdParamDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Controller for Membership endpoints
 * Handles HTTP requests and responses
 */
class MembershipController {
  private membershipService: MembershipService;
  private volunteerClubDao: VolunteerClubDao;

  constructor(membershipService: MembershipService, volunteerClubDao: VolunteerClubDao) {
    this.membershipService = membershipService;
    this.volunteerClubDao = volunteerClubDao;
  }

  /**
   * POST /api/memberships/request
   * Request to join a volunteer club (authenticated users)
   */
  requestMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const requestDto = req.body as RequestMembershipDto;
      const result = await this.membershipService.requestMembership(req.user.id!, requestDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Membership request submitted successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to submit membership request', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/memberships/me
   * Get user's memberships (authenticated users)
   */
  getMyMemberships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const result = await this.membershipService.getMyMemberships(req.user.id!);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Memberships retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve memberships', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/memberships/club/:clubId
   * Get all memberships for a volunteer club (club admins or system admins)
   */
  getClubMemberships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const clubIdParam = req.params as unknown as { clubId: string };
      const clubId = parseInt(clubIdParam.clubId, 10);

      if (isNaN(clubId)) {
        res.sendError('Invalid volunteer club ID', 400);
        return;
      }

      // Check if user is system admin or club admin
      const isSystemAdmin = req.user.role === UserRole.SYSTEM_ADMINISTRATOR || req.user.role === UserRole.ADMIN;
      const isClubAdmin = req.user.role === UserRole.VOLUNTEER_CLUB;

      if (!isSystemAdmin && !isClubAdmin) {
        res.sendError('Insufficient permissions', 403);
        return;
      }

      // If volunteer club user, verify they own the club
      if (isClubAdmin && !isSystemAdmin) {
        const club = await this.volunteerClubDao.findByUserId(req.user.id!);
        if (!club || club.id !== clubId) {
          res.sendError('You can only view memberships for your own club', 403);
          return;
        }
      }

      const result = await this.membershipService.getClubMemberships(clubId, req.user.id!);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Club memberships retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve club memberships', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/memberships/:id
   * Get membership by ID (user, club admin, or system admin)
   */
  getMembershipById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const idParam = req.params as unknown as IdParamDto;
      const id = parseInt(idParam.id, 10);

      if (isNaN(id)) {
        res.sendError('Invalid membership ID', 400);
        return;
      }

      // Check permissions - user can view their own, admins can view any
      const isSystemAdmin = req.user.role === UserRole.SYSTEM_ADMINISTRATOR || req.user.role === UserRole.ADMIN;
      
      // Get membership to check if user owns it
      const result = await this.membershipService.getMembershipById(id, req.user.id!);

      if (!result.success && !isSystemAdmin) {
        // If not system admin and service returned error, check if it's access denied
        // For now, allow system admins to bypass the check
        if (result.error === 'Access denied') {
          // Try to get membership directly for admin
          if (isSystemAdmin) {
            const adminResult = await this.membershipService.getMembershipById(id, req.user.id!);
            if (adminResult.success && adminResult.data) {
              res.sendSuccess(adminResult.data, 'Membership retrieved successfully', 200);
              return;
            }
          }
        }
        res.sendError(result.error || 'Membership not found', 404);
        return;
      }

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Membership retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Membership not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/memberships/:id/review
   * Approve/reject a membership request (club admins or system admins)
   */
  reviewMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const idParam = req.params as unknown as IdParamDto;
      const id = parseInt(idParam.id, 10);

      if (isNaN(id)) {
        res.sendError('Invalid membership ID', 400);
        return;
      }

      const reviewDto = req.body as ReviewMembershipDto;

      // Check if user is system admin or club admin
      const isSystemAdmin = req.user.role === UserRole.SYSTEM_ADMINISTRATOR || req.user.role === UserRole.ADMIN;
      const isClubAdmin = req.user.role === UserRole.VOLUNTEER_CLUB;

      if (!isSystemAdmin && !isClubAdmin) {
        res.sendError('Insufficient permissions', 403);
        return;
      }

      // If volunteer club user, verify they own the club for this membership
      if (isClubAdmin && !isSystemAdmin) {
        // Get membership to check club ownership
        const membershipResult = await this.membershipService.getMembershipById(id, req.user.id!);
        if (!membershipResult.success || !membershipResult.data) {
          res.sendError('Membership not found', 404);
          return;
        }

        const club = await this.volunteerClubDao.findByUserId(req.user.id!);
        if (!club || club.id !== membershipResult.data.volunteerClubId) {
          res.sendError('You can only review memberships for your own club', 403);
          return;
        }
      }

      const result = await this.membershipService.reviewMembership(id, reviewDto, req.user.id!);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Membership reviewed successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to review membership', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/memberships/:id
   * Cancel a membership request (user cancels their own request)
   */
  cancelMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const idParam = req.params as unknown as IdParamDto;
      const id = parseInt(idParam.id, 10);

      if (isNaN(id)) {
        res.sendError('Invalid membership ID', 400);
        return;
      }

      const result = await this.membershipService.cancelMembership(id, req.user.id!);

      if (result.success) {
        res.sendSuccess(undefined, result.message || 'Membership request cancelled successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to cancel membership request', 400);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default MembershipController;

