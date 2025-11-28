import { Request, Response, NextFunction } from 'express';
import { CampService } from '../services';
import { CreateCampDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { CampType, CampNeed } from '@nx-mono-repo-deployment-test/shared/src/enums';

/**
 * Controller for Camp endpoints
 * Handles HTTP requests and responses
 * Public endpoints - no authentication required
 */
class CampController {
  private campService: CampService;

  constructor(campService: CampService) {
    this.campService = campService;
  }

  /**
   * GET /api/camps
   * Get all camps with optional filters
   * Query params: campType, needs (comma-separated), district
   */
  getCamps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: {
        campType?: CampType;
        needs?: CampNeed[];
        district?: string;
      } = {};

      // Parse query parameters
      if (req.query.campType) {
        filters.campType = req.query.campType as CampType;
      }
      if (req.query.needs) {
        // Parse comma-separated needs
        const needsStr = req.query.needs as string;
        filters.needs = needsStr.split(',').map(n => n.trim()) as CampNeed[];
      }
      if (req.query.district) {
        filters.district = req.query.district as string;
      }

      const result = await this.campService.getAllCamps(filters);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve camps', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/camps
   * Create a new camp
   * Note: Body validation is handled by middleware
   */
  createCamp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Body is already validated and transformed to CreateCampDto by middleware
      const createCampDto = req.body as CreateCampDto;
      const result = await this.campService.createCamp(createCampDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Camp created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create camp', 400);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default CampController;

