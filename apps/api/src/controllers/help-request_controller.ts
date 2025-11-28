import { Request, Response, NextFunction } from 'express';
import { HelpRequestService } from '../services';
import { CreateHelpRequestDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { HelpRequestCategory, Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums';

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
   * Query params: category, urgency, district
   */
  getHelpRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: {
        category?: HelpRequestCategory;
        urgency?: Urgency;
        district?: string;
      } = {};

      // Parse query parameters
      if (req.query.category) {
        filters.category = req.query.category as HelpRequestCategory;
      }
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
}

export default HelpRequestController;

