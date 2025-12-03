import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { IUser } from '../types/user';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';

export interface SystemAdmin extends IUser {
  permissions?: Permission[];
}

export interface CreateSystemAdminData {
  username: string;
  password: string;
  contactNumber?: string;
}

export interface UpdateSystemAdminData {
  username?: string;
  contactNumber?: string;
}

export interface UpdatePermissionsData {
  permissions: Permission[];
}

/**
 * Admin Management Service
 */
class AdminManagementService {
  private static instance: AdminManagementService;
  private readonly basePath = '/api/admin/system-administrators';

  private constructor() {}

  public static getInstance(): AdminManagementService {
    if (!AdminManagementService.instance) {
      AdminManagementService.instance = new AdminManagementService();
    }
    return AdminManagementService.instance;
  }

  /**
   * Get all system administrators
   */
  public async getAllSystemAdmins(): Promise<IApiResponse<SystemAdmin[]>> {
    try {
      const response = await apiClient.get<IApiResponse<SystemAdmin[]>>(this.basePath);
      return response;
    } catch (error) {
      console.error('Error in AdminManagementService.getAllSystemAdmins:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch system administrators',
      };
    }
  }

  /**
   * Get system administrator by ID
   */
  public async getSystemAdminById(id: number): Promise<IApiResponse<SystemAdmin>> {
    try {
      const response = await apiClient.get<IApiResponse<SystemAdmin>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in AdminManagementService.getSystemAdminById (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch system administrator',
      };
    }
  }

  /**
   * Create system administrator
   */
  public async createSystemAdmin(data: CreateSystemAdminData): Promise<IApiResponse<SystemAdmin>> {
    try {
      const response = await apiClient.post<IApiResponse<SystemAdmin>>(this.basePath, data);
      return response;
    } catch (error) {
      console.error('Error in AdminManagementService.createSystemAdmin:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create system administrator',
      };
    }
  }

  /**
   * Update system administrator
   */
  public async updateSystemAdmin(id: number, data: UpdateSystemAdminData): Promise<IApiResponse<SystemAdmin>> {
    try {
      const response = await apiClient.put<IApiResponse<SystemAdmin>>(`${this.basePath}/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error in AdminManagementService.updateSystemAdmin (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update system administrator',
      };
    }
  }

  /**
   * Update system administrator permissions
   */
  public async updatePermissions(id: number, data: UpdatePermissionsData): Promise<IApiResponse<SystemAdmin>> {
    try {
      const response = await apiClient.put<IApiResponse<SystemAdmin>>(`${this.basePath}/${id}/permissions`, data);
      return response;
    } catch (error) {
      console.error(`Error in AdminManagementService.updatePermissions (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update permissions',
      };
    }
  }

  /**
   * Update system administrator status
   */
  public async updateStatus(id: number, status: string): Promise<IApiResponse<SystemAdmin>> {
    try {
      const response = await apiClient.put<IApiResponse<SystemAdmin>>(`${this.basePath}/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error(`Error in AdminManagementService.updateStatus (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status',
      };
    }
  }

  /**
   * Delete system administrator
   */
  public async deleteSystemAdmin(id: number): Promise<IApiResponse<void>> {
    try {
      const response = await apiClient.delete<IApiResponse<void>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in AdminManagementService.deleteSystemAdmin (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete system administrator',
      };
    }
  }
}

export const adminManagementService = AdminManagementService.getInstance();
export default adminManagementService;

