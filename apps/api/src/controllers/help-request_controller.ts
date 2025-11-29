import { Request, Response, NextFunction } from 'express';
import { HelpRequestService } from '../services';
import { CreateHelpRequestDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Controller for HelpRequest endpoints
 * Handles HTTP requests and responses
 * GET endpoints are public, POST requires authentication
 */
class HelpRequestController {
  private helpRequestService: HelpRequestService;

  constructor(helpRequestService: HelpRequestService) {
    this.helpRequestService = helpRequestService;
  }

  /**
   * GET /api/help-requests
   * Get all help requests with optional filters
   * Query params: urgency, district
   */
  getHelpRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: {
        urgency?: Urgency;
        district?: string;
      } = {};

      // Parse query parameters
      if (req.query.urgency) {
        filters.urgency = req.query.urgency as Urgency;
      }
      if (req.query.district) {
        filters.district = req.query.district as string;
      }

      const result = await this.helpRequestService.getAllHelpRequests(filters);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve help requests', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/help-requests/:id
   * Get a single help request by ID
   * Ownership is determined by the backend based on authenticated user
   */
  getHelpRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.sendError('Invalid help request ID', 400);
        return;
      }

      // Get requester user ID if authenticated (to determine ownership)
      const requesterUserId = req.user?.id;

      const result = await this.helpRequestService.getHelpRequestById(id, requesterUserId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Help request not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/help-requests
   * Create a new help request
   * Requires authentication - tracks which user created the request
   * Note: Body validation is handled by middleware
   * Note: req.user is set by authenticate middleware
   */
  createHelpRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Body is already validated and transformed to CreateHelpRequestDto by middleware
      const createHelpRequestDto = req.body as CreateHelpRequestDto;
      
      // Get user ID from authenticated user (set by authenticate middleware)
      const userId = req.user?.id;

      const result = await this.helpRequestService.createHelpRequest(createHelpRequestDto, userId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Help request created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create help request', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/help-requests/summary
   * Get comprehensive summary statistics for help requests
   * Returns counts by urgency, status, district, people totals, and ration items
   */
  getHelpRequestsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.helpRequestService.getHelpRequestsSummary();

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve help requests summary', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/help-requests/:id/inventory
   * Get inventory items for a help request
   * Returns inventory summary with pending, donated, and remaining quantities
   */
  getInventoryItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const helpRequestId = parseInt(req.params.id, 10);
      if (isNaN(helpRequestId)) {
        res.sendError('Invalid help request ID', 400);
        return;
      }

      const result = await this.helpRequestService.getInventoryItems(helpRequestId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve inventory items', result.success ? 200 : 404);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default HelpRequestController;

