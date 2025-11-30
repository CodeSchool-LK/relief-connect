import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { IUser, IUpdateUser, IUpdateUserRole, IUpdateUserStatus } from '../types/user';

/**
 * User Service
 * Handles all user-related API calls (admin operations)
 */
class UserService {
  private static instance: UserService;
  private readonly basePath = '/api/users';

  private constructor() {}

  /**
   * Get UserService singleton instance
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Get all users (admin only)
   */
  public async getAllUsers(): Promise<IApiResponse<IUser[]>> {
    try {
      const response = await apiClient.get<IApiResponse<IUser[]>>(this.basePath);
      return response;
    } catch (error) {
      console.error('Error in UserService.getAllUsers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      };
    }
  }

  /**
   * Get user by ID (admin only)
   */
  public async getUserById(id: number): Promise<IApiResponse<IUser>> {
    try {
      const response = await apiClient.get<IApiResponse<IUser>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in UserService.getUserById (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      };
    }
  }

  /**
   * Update user (admin only)
   */
  public async updateUser(id: number, data: IUpdateUser): Promise<IApiResponse<IUser>> {
    try {
      const response = await apiClient.put<IApiResponse<IUser>>(`${this.basePath}/${id}`, data);
      return response;
    } catch (error) {
      console.error(`Error in UserService.updateUser (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  /**
   * Update user role (admin only)
   */
  public async updateUserRole(id: number, data: IUpdateUserRole): Promise<IApiResponse<IUser>> {
    try {
      const response = await apiClient.put<IApiResponse<IUser>>(`${this.basePath}/${id}/role`, data);
      return response;
    } catch (error) {
      console.error(`Error in UserService.updateUserRole (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user role',
      };
    }
  }

  /**
   * Update user status (admin only)
   */
  public async updateUserStatus(id: number, data: IUpdateUserStatus): Promise<IApiResponse<IUser>> {
    try {
      const response = await apiClient.put<IApiResponse<IUser>>(`${this.basePath}/${id}/status`, data);
      return response;
    } catch (error) {
      console.error(`Error in UserService.updateUserStatus (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status',
      };
    }
  }

  /**
   * Generate password for user (admin only)
   */
  public async generatePasswordForUser(id: number): Promise<IApiResponse<{ password: string }>> {
    try {
      const response = await apiClient.post<IApiResponse<{ password: string }>>(`${this.basePath}/${id}/generate-password`);
      return response;
    } catch (error) {
      console.error(`Error in UserService.generatePasswordForUser (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate password',
      };
    }
  }

  /**
   * Create volunteer club user account (admin only)
   */
  public async createVolunteerClubUser(data: {
    username: string;
    contactNumber?: string;
    password?: string;
    clubName: string;
    clubDescription?: string;
    clubEmail?: string;
    clubAddress?: string;
  }): Promise<IApiResponse<{ user: IUser; password: string }>> {
    try {
      const response = await apiClient.post<IApiResponse<{ user: IUser; password: string }>>(
        '/api/admin/volunteer-club-users',
        data
      );
      return response;
    } catch (error) {
      console.error('Error in UserService.createVolunteerClubUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create volunteer club user',
      };
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance();
export default userService;

