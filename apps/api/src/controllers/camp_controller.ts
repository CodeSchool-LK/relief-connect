import { Request, Response, NextFunction } from 'express';
import { CampService } from '../services';
import { CreateCampDto, UpdateCampDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
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
   * Query params: campType, needs (comma-separated), district, minLat, maxLat, minLng, maxLng
   */
  getCamps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: {
        campType?: CampType;
        needs?: CampNeed[];
        district?: string;
        bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
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
      
      // Parse bounds parameters
      if (req.query.minLat && req.query.maxLat && req.query.minLng && req.query.maxLng) {
        const minLat = parseFloat(req.query.minLat as string);
        const maxLat = parseFloat(req.query.maxLat as string);
        const minLng = parseFloat(req.query.minLng as string);
        const maxLng = parseFloat(req.query.maxLng as string);
        
        // Validate bounds: ensure they are valid numbers and min < max
        if (
          !isNaN(minLat) && !isNaN(maxLat) && !isNaN(minLng) && !isNaN(maxLng) &&
          minLat < maxLat && minLng < maxLng &&
          minLat >= -90 && maxLat <= 90 && minLng >= -180 && maxLng <= 180
        ) {
          filters.bounds = { minLat, maxLat, minLng, maxLng };
        }
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
   * GET /api/camps/:id
   * Get a single camp by ID (public - no authentication required)
   */
  getCampById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campId = parseInt(req.params.id, 10);
      
      if (isNaN(campId)) {
        res.sendError('Invalid camp ID', 400);
        return;
      }

      // Pass user info if authenticated, otherwise undefined (allows public access)
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const result = await this.campService.getCampById(campId, userId, userRole);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        const statusCode = result.error === 'Camp not found' ? 404 : 
                          result.error === 'Authentication required' ? 401 :
                          result.error?.includes('Access denied') ? 403 : 500;
        res.sendError(result.error || 'Camp not found', statusCode);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/camps/:id
   * Update an existing camp (only accessible by admins or owning volunteer club)
   * Note: Body validation is handled by middleware
   */
  updateCamp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const campId = parseInt(req.params.id, 10);
      if (isNaN(campId)) {
        res.sendError('Invalid camp ID', 400);
        return;
      }

      // Body is already validated and transformed to UpdateCampDto by middleware
      const updateCampDto = req.body as UpdateCampDto;
      const result = await this.campService.updateCamp(campId, updateCampDto, req.user.id, req.user.role);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Camp updated successfully', 200);
      } else {
        const statusCode = result.error === 'Camp not found' ? 404 : 
                          result.error?.includes('Access denied') ? 403 : 400;
        res.sendError(result.error || 'Failed to update camp', statusCode);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/camps
   * Create a new camp (volunteer club only)
   * Note: Body validation is handled by middleware
   */
  createCamp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.sendError('User not authenticated', 401);
        return;
      }

      // Body is already validated and transformed to CreateCampDto by middleware
      const createCampDto = req.body as CreateCampDto;
      const result = await this.campService.createCamp(createCampDto, req.user.id);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Camp created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create camp', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/camps/:id/inventory
   * Get inventory items for a camp
   */
  getCampInventoryItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campId = parseInt(req.params.id, 10);
      if (isNaN(campId)) {
        res.sendError('Invalid camp ID', 400);
        return;
      }

      const result = await this.campService.getCampInventoryItems(campId);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve camp inventory items', result.success ? 200 : 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/camps/drop-off-locations
   * Get all drop-off locations for active camps
   */
  getAllDropOffLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.campService.getAllDropOffLocationsForActiveCamps();

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve drop-off locations', 500);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default CampController;

