import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { SystemSettingType } from '@nx-mono-repo-deployment-test/shared/src/enums';

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: SystemSettingType;
  description?: string;
  category?: string;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSystemSettingData {
  value?: string;
  type?: SystemSettingType;
  description?: string;
  category?: string;
}

export interface BulkUpdateSettingsData {
  settings: Array<{ key: string; value: string }>;
}

/**
 * System Settings Service
 */
class SystemSettingsService {
  private static instance: SystemSettingsService;
  private readonly basePath = '/api/admin/system-settings';

  private constructor() {}

  public static getInstance(): SystemSettingsService {
    if (!SystemSettingsService.instance) {
      SystemSettingsService.instance = new SystemSettingsService();
    }
    return SystemSettingsService.instance;
  }

  /**
   * Get all system settings
   */
  public async getAllSettings(): Promise<IApiResponse<SystemSetting[]>> {
    try {
      const response = await apiClient.get<IApiResponse<SystemSetting[]>>(this.basePath);
      return response;
    } catch (error) {
      console.error('Error in SystemSettingsService.getAllSettings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch system settings',
      };
    }
  }

  /**
   * Get system settings by category
   */
  public async getSettingsByCategory(category: string): Promise<IApiResponse<SystemSetting[]>> {
    try {
      const response = await apiClient.get<IApiResponse<SystemSetting[]>>(`${this.basePath}/${category}`);
      return response;
    } catch (error) {
      console.error(`Error in SystemSettingsService.getSettingsByCategory (${category}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch system settings',
      };
    }
  }

  /**
   * Get system setting by key
   */
  public async getSettingByKey(key: string): Promise<IApiResponse<SystemSetting>> {
    try {
      const response = await apiClient.get<IApiResponse<SystemSetting>>(`${this.basePath}/key/${key}`);
      return response;
    } catch (error) {
      console.error(`Error in SystemSettingsService.getSettingByKey (${key}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch system setting',
      };
    }
  }

  /**
   * Update system setting
   */
  public async updateSetting(key: string, data: UpdateSystemSettingData): Promise<IApiResponse<SystemSetting>> {
    try {
      const response = await apiClient.put<IApiResponse<SystemSetting>>(`${this.basePath}/${key}`, data);
      return response;
    } catch (error) {
      console.error(`Error in SystemSettingsService.updateSetting (${key}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update system setting',
      };
    }
  }

  /**
   * Bulk update system settings
   */
  public async bulkUpdateSettings(data: BulkUpdateSettingsData): Promise<IApiResponse<SystemSetting[]>> {
    try {
      const response = await apiClient.post<IApiResponse<SystemSetting[]>>(`${this.basePath}/bulk`, data);
      return response;
    } catch (error) {
      console.error('Error in SystemSettingsService.bulkUpdateSettings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update system settings',
      };
    }
  }
}

export const systemSettingsService = SystemSettingsService.getInstance();
export default systemSettingsService;

