import { SystemSettingDao } from '../dao';
import { 
  UpdateSystemSettingDto,
  BulkUpdateSettingsDto,
  SystemSettingResponseDto 
} from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { ISystemSetting } from '../models/system-setting.model';

/**
 * Service layer for System Settings Management
 */
class SystemSettingsService {
  private static instance: SystemSettingsService;
  private systemSettingDao: SystemSettingDao;

  private constructor(systemSettingDao: SystemSettingDao) {
    this.systemSettingDao = systemSettingDao;
  }

  public static getInstance(): SystemSettingsService {
    if (!SystemSettingsService.instance) {
      SystemSettingsService.instance = new SystemSettingsService(
        SystemSettingDao.getInstance()
      );
    }
    return SystemSettingsService.instance;
  }

  /**
   * Get all system settings
   */
  public async getAllSettings(): Promise<IApiResponse<SystemSettingResponseDto[]>> {
    try {
      const settings = await this.systemSettingDao.findAll();
      return {
        success: true,
        data: settings.map(setting => new SystemSettingResponseDto(setting)),
      };
    } catch (error) {
      console.error('Error in SystemSettingsService.getAllSettings:', error);
      return {
        success: false,
        error: 'Failed to retrieve system settings',
      };
    }
  }

  /**
   * Get system settings by category
   */
  public async getSettingsByCategory(category: string): Promise<IApiResponse<SystemSettingResponseDto[]>> {
    try {
      const settings = await this.systemSettingDao.findByCategory(category);
      return {
        success: true,
        data: settings.map(setting => new SystemSettingResponseDto(setting)),
      };
    } catch (error) {
      console.error(`Error in SystemSettingsService.getSettingsByCategory (${category}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve system settings',
      };
    }
  }

  /**
   * Get system setting by key
   */
  public async getSettingByKey(key: string): Promise<IApiResponse<SystemSettingResponseDto>> {
    try {
      const setting = await this.systemSettingDao.findByKey(key);
      if (!setting) {
        return {
          success: false,
          error: 'System setting not found',
        };
      }
      return {
        success: true,
        data: new SystemSettingResponseDto(setting),
      };
    } catch (error) {
      console.error(`Error in SystemSettingsService.getSettingByKey (${key}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve system setting',
      };
    }
  }

  /**
   * Update system setting by key
   */
  public async updateSetting(
    key: string,
    updateDto: UpdateSystemSettingDto,
    updatedBy: number
  ): Promise<IApiResponse<SystemSettingResponseDto>> {
    try {
      const existingSetting = await this.systemSettingDao.findByKey(key);
      if (!existingSetting) {
        return {
          success: false,
          error: 'System setting not found',
        };
      }

      const updateData: Partial<ISystemSetting> = {};
      if (updateDto.value !== undefined) {
        updateData.value = updateDto.value;
      }
      if (updateDto.type !== undefined) {
        updateData.type = updateDto.type;
      }
      if (updateDto.description !== undefined) {
        updateData.description = updateDto.description;
      }
      if (updateDto.category !== undefined) {
        updateData.category = updateDto.category;
      }

      const updatedSetting = await this.systemSettingDao.updateByKey(key, updateData, updatedBy);
      if (!updatedSetting) {
        return {
          success: false,
          error: 'Failed to update system setting',
        };
      }

      // TODO: Log audit action - SYSTEM_SETTING_UPDATED
      // await auditLogService.logAction(...)

      return {
        success: true,
        data: new SystemSettingResponseDto(updatedSetting),
        message: 'System setting updated successfully',
      };
    } catch (error) {
      console.error(`Error in SystemSettingsService.updateSetting (${key}):`, error);
      return {
        success: false,
        error: 'Failed to update system setting',
      };
    }
  }

  /**
   * Bulk update system settings
   */
  public async bulkUpdateSettings(
    bulkUpdateDto: BulkUpdateSettingsDto,
    updatedBy: number
  ): Promise<IApiResponse<SystemSettingResponseDto[]>> {
    try {
      const updates = bulkUpdateDto.settings.map(setting => ({
        key: setting.key,
        value: setting.value,
        updatedBy,
      }));

      const updatedSettings = await this.systemSettingDao.bulkUpdate(updates);

      // TODO: Log audit action - SYSTEM_SETTING_UPDATED (bulk)
      // await auditLogService.logAction(...)

      return {
        success: true,
        data: updatedSettings.map(setting => new SystemSettingResponseDto(setting)),
        message: 'System settings updated successfully',
      };
    } catch (error) {
      console.error('Error in SystemSettingsService.bulkUpdateSettings:', error);
      return {
        success: false,
        error: 'Failed to update system settings',
      };
    }
  }
}

export default SystemSettingsService;
export { SystemSettingsService };

