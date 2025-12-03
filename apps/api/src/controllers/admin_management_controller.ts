import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { AdminManagementService, AuditLogService } from '../services';
import { 
  CreateSystemAdminDto, 
  UpdateSystemAdminDto, 
  UpdatePermissionsDto,
  PaginationDto,
} from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { UserStatus, AuditAction } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ResourceType } from '../constants/resource-types';

/**
 * Controller for System Administrator Management endpoints
 * Handles HTTP requests and responses
 */
class AdminManagementController {
  private adminManagementService: AdminManagementService;
  private auditLogService: AuditLogService;

  constructor(adminManagementService: AdminManagementService) {
    this.adminManagementService = adminManagementService;
    this.auditLogService = AuditLogService.getInstance();
  }

  /**
   * GET /api/admin/system-administrators
   * List all system administrators with pagination
   * Query params: page (default: 1), limit (default: 10, max: 100)
   * Note: req.query is validated by PaginationDto middleware
   */
  getAllSystemAdmins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get validated pagination parameters from DTO
      const pagination = req.query as unknown as PaginationDto;
      const page = pagination.getPage();
      const limit = pagination.getLimit();

      const result = await this.adminManagementService.getAllSystemAdmins(page, limit);

      if (result.success && result.data) {
        // Manually build response to include the total count for pagination
        const response: IApiResponse<typeof result.data> = {
          success: true,
          data: result.data,
          count: result.count, // Include total count from service (not just array length)
        };
        if (result.message) {
          response.message = result.message;
        }
        res.status(200).json(response);
      } else {
        res.sendError(result.error || 'Failed to retrieve system administrators', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/system-administrators/:id
   * Get system administrator by ID
   * Note: req.params.id is validated by IdParamDto middleware
   */
  getSystemAdminById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // id is already validated and converted to number by IdParamDto
      const id = (req.params as unknown as { id: number }).id;

      const result = await this.adminManagementService.getSystemAdminById(id);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'System administrator retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'System administrator not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/system-administrators
   * Create a new system administrator
   * Note: req.user is guaranteed by authenticate middleware, req.body is validated by CreateSystemAdminDto
   */
  createSystemAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createDto = req.body as CreateSystemAdminDto;
      const authReq = req as AuthenticatedRequest;
      const result = await this.adminManagementService.createSystemAdmin(
        createDto,
        authReq.user.id!
      );

      if (result.success && result.data) {
        // Log audit action with creator information
        await this.auditLogService.logAction(
          AuditAction.SYSTEM_ADMIN_CREATED,
          authReq.user.id,
          req,
          ResourceType.SYSTEM_ADMINISTRATOR,
          result.data.id,
          { 
            username: result.data.username,
            createdBy: authReq.user.id,
            createdByRole: authReq.user.role,
            createdByUsername: authReq.user.username
          }
        );

        res.sendSuccess(result.data, result.message || 'System administrator created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create system administrator', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/admin/system-administrators/:id
   * Update system administrator details
   * Note: req.user is guaranteed by authenticate middleware, req.params.id and req.body are validated
   */
  updateSystemAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // id is already validated and converted to number by IdParamDto
      const id = (req.params as unknown as { id: number }).id;
      const updateDto = req.body as UpdateSystemAdminDto;
      const authReq = req as AuthenticatedRequest;
      const result = await this.adminManagementService.updateSystemAdmin(
        id,
        updateDto,
        authReq.user.id!
      );

      if (result.success && result.data) {
        // Log audit action
        await this.auditLogService.logAction(
          AuditAction.SYSTEM_ADMIN_UPDATED,
          authReq.user.id,
          req,
          ResourceType.SYSTEM_ADMINISTRATOR,
          id,
          { changes: updateDto }
        );

        res.sendSuccess(result.data, result.message || 'System administrator updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update system administrator', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/admin/system-administrators/:id/permissions
   * Update system administrator permissions
   * Note: req.user is guaranteed by authenticate middleware, req.params.id and req.body are validated
   */
  updatePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // id is already validated and converted to number by IdParamDto
      const id = (req.params as unknown as { id: number }).id;
      const updateDto = req.body as UpdatePermissionsDto;
      const authReq = req as AuthenticatedRequest;
      const result = await this.adminManagementService.updatePermissions(
        id,
        updateDto,
        authReq.user.id!
      );

      if (result.success && result.data) {
        // Log audit action
        await this.auditLogService.logAction(
          AuditAction.PERMISSIONS_ASSIGNED,
          authReq.user.id,
          req,
          ResourceType.SYSTEM_ADMINISTRATOR,
          id,
          { permissions: updateDto.permissions }
        );

        res.sendSuccess(result.data, result.message || 'Permissions updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update permissions', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/admin/system-administrators/:id/status
   * Update system administrator status
   * Note: req.user is guaranteed by authenticate middleware, req.params.id is validated
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // id is already validated and converted to number by IdParamDto
      const id = (req.params as unknown as { id: number }).id;
      const { status } = req.body;
      if (!status) {
        res.sendError('Status is required', 400);
        return;
      }

      if (!Object.values(UserStatus).includes(status)) {
        res.sendError('Invalid status value', 400);
        return;
      }

      const authReq = req as AuthenticatedRequest;
      const result = await this.adminManagementService.updateStatus(
        id,
        status,
        authReq.user.id!
      );

      if (result.success && result.data) {
        // Log audit action
        await this.auditLogService.logAction(
          AuditAction.SYSTEM_ADMIN_UPDATED,
          authReq.user.id,
          req,
          ResourceType.SYSTEM_ADMINISTRATOR,
          id,
          { status }
        );

        res.sendSuccess(result.data, result.message || 'Status updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update status', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/admin/system-administrators/:id
   * Delete system administrator (soft delete)
   * Note: req.user is guaranteed by authenticate middleware, req.params.id is validated
   */
  deleteSystemAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // id is already validated and converted to number by IdParamDto
      const id = (req.params as unknown as { id: number }).id;
      const authReq = req as AuthenticatedRequest;
      const result = await this.adminManagementService.deleteSystemAdmin(
        id,
        authReq.user.id!
      );

      if (result.success) {
        // Log audit action
        await this.auditLogService.logAction(
          AuditAction.SYSTEM_ADMIN_DELETED,
          authReq.user.id,
          req,
          ResourceType.SYSTEM_ADMINISTRATOR,
          id
        );

        res.sendSuccess(null, result.message || 'System administrator deleted successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to delete system administrator', 400);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default AdminManagementController;
export { AdminManagementController };

