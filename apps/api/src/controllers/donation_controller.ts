import { Request, Response, NextFunction } from 'express';
import { DonationService } from '../services';
import { CreateDonationDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Controller for Donation endpoints
 * Handles HTTP requests and responses
 * All endpoints require authentication
 */
class DonationController {
  private donationService: DonationService;

  constructor(donationService: DonationService) {
    this.donationService = donationService;
  }

  /**
   * GET /api/donations/my
   * Get all donations made by the authenticated user
   */
  getMyDonations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const donatorId = req.user?.id;
      if (!donatorId) {
        res.sendError('Authentication required', 401);
        return;
      }

      const result = await this.donationService.getMyDonations(donatorId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve donations', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/help-requests/:helpRequestId/donations
   * Get all donations for a help request
   */
  getDonationsByHelpRequestId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const helpRequestId = parseInt(req.params.helpRequestId, 10);
      if (isNaN(helpRequestId)) {
        res.sendError('Invalid help request ID', 400);
        return;
      }

      // Get requester user ID if authenticated (to check if they're the owner)
      const requesterUserId = req.user?.id;

      const result = await this.donationService.getDonationsByHelpRequestId(helpRequestId, requesterUserId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve donations', result.success ? 200 : 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/help-requests/:helpRequestId/donations
   * Create a new donation for a help request
   * Requires authentication - tracks which user created the donation
   */
  createDonation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const helpRequestId = parseInt(req.params.helpRequestId, 10);
      if (isNaN(helpRequestId)) {
        res.sendError('Invalid help request ID', 400);
        return;
      }

      // Body is already validated and transformed to CreateDonationDto by middleware
      const createDonationDto = req.body as CreateDonationDto;
      createDonationDto.helpRequestId = helpRequestId; // Override with URL param

      // Get user ID from authenticated user (set by authenticate middleware)
      const donatorId = req.user?.id;
      if (!donatorId) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const result = await this.donationService.createDonation(createDonationDto, donatorId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Donation created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create donation', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/help-requests/:helpRequestId/donations/:donationId/schedule
   * Mark donation as scheduled by donator
   */
  markAsScheduled = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const donationId = parseInt(req.params.donationId, 10);
      if (isNaN(donationId)) {
        res.sendError('Invalid donation ID', 400);
        return;
      }

      const donatorId = req.user?.id;
      if (!donatorId) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const result = await this.donationService.markAsScheduled(donationId, donatorId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Donation marked as scheduled', 200);
      } else {
        res.sendError(result.error || 'Failed to mark donation as scheduled', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/help-requests/:helpRequestId/donations/:donationId/complete-donator
   * Mark donation as completed by donator
   */
  markAsCompletedByDonator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const donationId = parseInt(req.params.donationId, 10);
      if (isNaN(donationId)) {
        res.sendError('Invalid donation ID', 400);
        return;
      }

      const donatorId = req.user?.id;
      if (!donatorId) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const result = await this.donationService.markAsCompletedByDonator(donationId, donatorId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Donation marked as completed', 200);
      } else {
        res.sendError(result.error || 'Failed to mark donation as completed', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/help-requests/:helpRequestId/donations/:donationId/complete-owner
   * Mark donation as completed by help request owner
   */
  markAsCompletedByOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const donationId = parseInt(req.params.donationId, 10);
      if (isNaN(donationId)) {
        res.sendError('Invalid donation ID', 400);
        return;
      }

      const ownerId = req.user?.id;
      if (!ownerId) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const result = await this.donationService.markAsCompletedByOwner(donationId, ownerId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Donation marked as completed', 200);
      } else {
        res.sendError(result.error || 'Failed to mark donation as completed', 400);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default DonationController;

