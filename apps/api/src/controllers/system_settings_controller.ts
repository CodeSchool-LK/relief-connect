import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { SystemSettingsService, AuditLogService } from '../services';
import { 
  UpdateSystemSettingDto,
  BulkUpdateSettingsDto
} from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { AuditAction } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { ResourceType } from '../constants/resource-types';

/**
 * Controller for System Settings endpoints
 */
class SystemSettingsController {
  private systemSettingsService: SystemSettingsService;
  private auditLogService: AuditLogService;

  constructor(systemSettingsService: SystemSettingsService) {
    this.systemSettingsService = systemSettingsService;
    this.auditLogService = AuditLogService.getInstance();
  }

  /**
   * GET /api/admin/system-settings
   * Get all system settings
   */
  getAllSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.systemSettingsService.getAllSettings();

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'System settings retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve system settings', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/system-settings/:category
   * Get system settings by category
   */
  getSettingsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.params.category as string;
      const result = await this.systemSettingsService.getSettingsByCategory(category);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'System settings retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve system settings', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/system-settings/key/:key
   * Get system setting by key
   */
  getSettingByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key as string;
      const result = await this.systemSettingsService.getSettingByKey(key);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'System setting retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'System setting not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/admin/system-settings/:key
   * Update system setting
   * Note: req.user is guaranteed by authenticate middleware
   */
  updateSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key as string;
      const updateDto = req.body as UpdateSystemSettingDto;
      const authReq = req as AuthenticatedRequest;
      const result = await this.systemSettingsService.updateSetting(
        key,
        updateDto,
        authReq.user.id!
      );

      if (result.success && result.data) {
        // Log audit action
        await this.auditLogService.logAction(
          AuditAction.SYSTEM_SETTING_UPDATED,
          authReq.user.id,
          req,
          ResourceType.SYSTEM_SETTING,
          key,
          { value: updateDto.value }
        );

        res.sendSuccess(result.data, result.message || 'System setting updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update system setting', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/system-settings/bulk
   * Bulk update system settings
   * Note: req.user is guaranteed by authenticate middleware
   */
  bulkUpdateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bulkUpdateDto = req.body as BulkUpdateSettingsDto;
      const authReq = req as AuthenticatedRequest;
      const result = await this.systemSettingsService.bulkUpdateSettings(
        bulkUpdateDto,
        authReq.user.id!
      );

      if (result.success && result.data) {
        // Log audit action
        await this.auditLogService.logAction(
          AuditAction.SYSTEM_SETTING_UPDATED,
          authReq.user.id,
          req,
          ResourceType.SYSTEM_SETTING,
          'bulk',
          { count: bulkUpdateDto.settings.length }
        );

        res.sendSuccess(result.data, result.message || 'System settings updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update system settings', 400);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default SystemSettingsController;
export { SystemSettingsController };

