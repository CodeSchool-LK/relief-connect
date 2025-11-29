import { Request, Response, NextFunction } from 'express';
import { VolunteerClubService } from '../services';
import { CreateVolunteerClubDto, UpdateVolunteerClubDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { IdParamDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Controller for Volunteer Club endpoints
 * Handles HTTP requests and responses
 */
class VolunteerClubController {
  private volunteerClubService: VolunteerClubService;

  constructor(volunteerClubService: VolunteerClubService) {
    this.volunteerClubService = volunteerClubService;
  }

  /**
   * POST /api/volunteer-clubs
   * Create a new volunteer club (admin only)
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createDto = req.body as CreateVolunteerClubDto;
      const result = await this.volunteerClubService.createVolunteerClub(createDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Volunteer club created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create volunteer club', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/volunteer-clubs
   * Get all volunteer clubs (all authenticated users)
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.volunteerClubService.getAllVolunteerClubs();

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Volunteer clubs retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve volunteer clubs', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/volunteer-clubs/:id
   * Get volunteer club by ID (all authenticated users)
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = req.params as unknown as IdParamDto;
      const id = typeof idParam.id === 'string' ? parseInt(idParam.id, 10) : idParam.id;

      if (isNaN(id)) {
        res.sendError('Invalid volunteer club ID', 400);
        return;
      }

      const result = await this.volunteerClubService.getVolunteerClubById(id);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Volunteer club retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Volunteer club not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/volunteer-clubs/:id
   * Update a volunteer club (admin only)
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = req.params as unknown as IdParamDto;
      const id = typeof idParam.id === 'string' ? parseInt(idParam.id, 10) : idParam.id;

      if (isNaN(id)) {
        res.sendError('Invalid volunteer club ID', 400);
        return;
      }

      const updateDto = req.body as UpdateVolunteerClubDto;
      const result = await this.volunteerClubService.updateVolunteerClub(id, updateDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Volunteer club updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update volunteer club', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/volunteer-clubs/:id
   * Delete a volunteer club (admin only)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParam = req.params as unknown as IdParamDto;
      const id = typeof idParam.id === 'string' ? parseInt(idParam.id, 10) : idParam.id;

      if (isNaN(id)) {
        res.sendError('Invalid volunteer club ID', 400);
        return;
      }

      const result = await this.volunteerClubService.deleteVolunteerClub(id);

      if (result.success) {
        res.sendSuccess(undefined, result.message || 'Volunteer club deleted successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to delete volunteer club', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/volunteer-clubs/me
   * Get volunteer club for authenticated volunteer club user
   */
  getMyClub = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      const result = await this.volunteerClubService.getMyClub(req.user.id!);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Volunteer club retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Volunteer club not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default VolunteerClubController;

