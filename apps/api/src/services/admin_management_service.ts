import { UserDao } from '../dao';
import { 
  CreateSystemAdminDto, 
  UpdateSystemAdminDto, 
  UpdatePermissionsDto, 
  SystemAdminResponseDto 
} from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { UserRole, UserStatus, Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IApiResponse, IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces';

/**
 * Service layer for System Administrator Management
 * Handles business logic for managing system administrators
 */
class AdminManagementService {
  private static instance: AdminManagementService;
  private userDao: UserDao;

  private constructor(userDao: UserDao) {
    this.userDao = userDao;
  }

  /**
   * Get AdminManagementService singleton instance
   */
  public static getInstance(): AdminManagementService {
    if (!AdminManagementService.instance) {
      AdminManagementService.instance = new AdminManagementService(
        UserDao.getInstance()
      );
    }
    return AdminManagementService.instance;
  }

  /**
   * Get all system administrators with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10, max: 100)
   */
  public async getAllSystemAdmins(
    page: number = 1,
    limit: number = 10
  ): Promise<IApiResponse<SystemAdminResponseDto[]>> {
    try {
      const result = await this.userDao.findSystemAdministrators(page, limit);
      
      return {
        success: true,
        data: result.data.map(admin => new SystemAdminResponseDto(admin)),
        count: result.total, // Total count for pagination
      };
    } catch (error) {
      console.error('Error in AdminManagementService.getAllSystemAdmins:', error);
      return {
        success: false,
        error: 'Failed to retrieve system administrators',
      };
    }
  }

  /**
   * Get system administrator by ID
   */
  public async getSystemAdminById(id: number): Promise<IApiResponse<SystemAdminResponseDto>> {
    try {
      const user = await this.userDao.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'System administrator not found',
        };
      }

      if (user.role !== UserRole.SYSTEM_ADMINISTRATOR) {
        return {
          success: false,
          error: 'User is not a system administrator',
        };
      }

      return {
        success: true,
        data: new SystemAdminResponseDto(user),
      };
    } catch (error) {
      console.error(`Error in AdminManagementService.getSystemAdminById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve system administrator',
      };
    }
  }

  /**
   * Create a new system administrator
   * @param createDto - System administrator creation data
   * @param _createdBy - ID of the user creating this system administrator (used for audit logging in controller)
   */
  public async createSystemAdmin(
    createDto: CreateSystemAdminDto,
    _createdBy: number
  ): Promise<IApiResponse<SystemAdminResponseDto>> {
    try {
      // Username length is already validated by DTO at router level
      // Trim username for duplicate check and storage
      const trimmedUsername = createDto.username.trim();

      // Check if username already exists
      const existingUser = await this.userDao.findByUsername(trimmedUsername);
      if (existingUser) {
        return {
          success: false,
          error: 'Username already exists',
        };
      }

      // Create user with SYSTEM_ADMINISTRATOR role
      // UserDao.create will hash the password automatically
      const user = await this.userDao.create(
        {
          username: trimmedUsername,
          password: createDto.password,
          contactNumber: createDto.contactNumber,
        },
        UserRole.SYSTEM_ADMINISTRATOR
      );

      // Fetch the created user to get all fields
      const createdUser = await this.userDao.findById(user.id!);
      if (!createdUser) {
        return {
          success: false,
          error: 'Failed to retrieve created system administrator',
        };
      }

      // Note: Audit logging is handled in the controller to capture Request object (IP, User-Agent)
      // The createdBy parameter is passed to the controller for audit logging

      return {
        success: true,
        data: new SystemAdminResponseDto(createdUser),
        message: 'System administrator created successfully',
      };
    } catch (error) {
      console.error('Error in AdminManagementService.createSystemAdmin:', error);
      return {
        success: false,
        error: 'Failed to create system administrator',
      };
    }
  }

  /**
   * Update system administrator details
   */
  public async updateSystemAdmin(
    id: number,
    updateDto: UpdateSystemAdminDto,
    updatedBy: number
  ): Promise<IApiResponse<SystemAdminResponseDto>> {
    try {
      const user = await this.userDao.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'System administrator not found',
        };
      }

      if (user.role !== UserRole.SYSTEM_ADMINISTRATOR) {
        return {
          success: false,
          error: 'User is not a system administrator',
        };
      }

      // Prevent self-deletion (updating status to DISABLED)
      if (id === updatedBy && updateDto.status === UserStatus.DISABLED) {
        return {
          success: false,
          error: 'Cannot disable your own account',
        };
      }

      // Prepare update data
      const updateData: Partial<IUser> = {};
      if (updateDto.username) {
        // Username length is already validated by DTO at router level
        // Trim username for duplicate check and storage
        const trimmedUsername = updateDto.username.trim();

        // Check if username already exists (excluding current user)
        const existingUser = await this.userDao.findByUsername(trimmedUsername);
        if (existingUser && existingUser.id !== id) {
          return {
            success: false,
            error: 'Username already exists',
          };
        }
        updateData.username = trimmedUsername;
      }

      if (updateDto.contactNumber !== undefined) {
        updateData.contactNumber = updateDto.contactNumber?.trim();
      }

      const updatedUser = await this.userDao.update(id, updateData);
      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to update system administrator',
        };
      }

      // TODO: Log audit action - SYSTEM_ADMIN_UPDATED
      // await auditLogService.logAction(...)

      return {
        success: true,
        data: new SystemAdminResponseDto(updatedUser),
        message: 'System administrator updated successfully',
      };
    } catch (error) {
      console.error(`Error in AdminManagementService.updateSystemAdmin (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update system administrator',
      };
    }
  }

  /**
   * Update system administrator permissions
   */
  public async updatePermissions(
    id: number,
    updateDto: UpdatePermissionsDto,
    updatedBy: number
  ): Promise<IApiResponse<SystemAdminResponseDto>> {
    try {
      const user = await this.userDao.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'System administrator not found',
        };
      }

      if (user.role !== UserRole.SYSTEM_ADMINISTRATOR) {
        return {
          success: false,
          error: 'User is not a system administrator',
        };
      }

      // Prevent removing all permissions from yourself
      if (id === updatedBy && updateDto.permissions.length === 0) {
        return {
          success: false,
          error: 'Cannot remove all permissions from your own account',
        };
      }

      // Validate permissions are valid enum values
      const validPermissions = Object.values(Permission);
      const invalidPermissions = updateDto.permissions.filter(
        perm => !validPermissions.includes(perm)
      );

      if (invalidPermissions.length > 0) {
        return {
          success: false,
          error: `Invalid permissions: ${invalidPermissions.join(', ')}`,
        };
      }

      // Remove duplicates
      const uniquePermissions = [...new Set(updateDto.permissions)];

      const updatedUser = await this.userDao.update(id, { permissions: uniquePermissions });
      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to update permissions',
        };
      }

      // TODO: Log audit action - PERMISSIONS_ASSIGNED or PERMISSIONS_REVOKED
      // await auditLogService.logAction(...)

      return {
        success: true,
        data: new SystemAdminResponseDto(updatedUser),
        message: 'Permissions updated successfully',
      };
    } catch (error) {
      console.error(`Error in AdminManagementService.updatePermissions (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update permissions',
      };
    }
  }

  /**
   * Update system administrator status
   */
  public async updateStatus(
    id: number,
    status: UserStatus,
    updatedBy: number
  ): Promise<IApiResponse<SystemAdminResponseDto>> {
    try {
      const user = await this.userDao.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'System administrator not found',
        };
      }

      if (user.role !== UserRole.SYSTEM_ADMINISTRATOR) {
        return {
          success: false,
          error: 'User is not a system administrator',
        };
      }

      // Prevent self-deletion
      if (id === updatedBy && status === UserStatus.DISABLED) {
        return {
          success: false,
          error: 'Cannot disable your own account',
        };
      }

      const updatedUser = await this.userDao.update(id, { status });
      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to update status',
        };
      }

      // TODO: Log audit action - SYSTEM_ADMIN_UPDATED
      // await auditLogService.logAction(...)

      return {
        success: true,
        data: new SystemAdminResponseDto(updatedUser),
        message: 'Status updated successfully',
      };
    } catch (error) {
      console.error(`Error in AdminManagementService.updateStatus (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update status',
      };
    }
  }

  /**
   * Delete system administrator (soft delete - set status to DISABLED)
   */
  public async deleteSystemAdmin(
    id: number,
    deletedBy: number
  ): Promise<IApiResponse<void>> {
    try {
      const user = await this.userDao.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'System administrator not found',
        };
      }

      if (user.role !== UserRole.SYSTEM_ADMINISTRATOR) {
        return {
          success: false,
          error: 'User is not a system administrator',
        };
      }

      // Prevent self-deletion
      if (id === deletedBy) {
        return {
          success: false,
          error: 'Cannot delete your own account',
        };
      }

      // Soft delete by setting status to DISABLED
      await this.userDao.update(id, { status: UserStatus.DISABLED });

      // TODO: Log audit action - SYSTEM_ADMIN_DELETED
      // await auditLogService.logAction(...)

      return {
        success: true,
        message: 'System administrator deleted successfully',
      };
    } catch (error) {
      console.error(`Error in AdminManagementService.deleteSystemAdmin (${id}):`, error);
      return {
        success: false,
        error: 'Failed to delete system administrator',
      };
    }
  }
}

export default AdminManagementService;
export { AdminManagementService };

