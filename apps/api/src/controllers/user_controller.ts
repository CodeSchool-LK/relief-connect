import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services';
import { CreateUserDto,UserResponseDto, CreateAdminDto, CreateVolunteerClubUserDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Controller for User endpoints
 * Handles HTTP requests and responses
 */
class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * POST /api/users/register
   * Register a new user or login if username exists
   * Always returns login response with tokens
   * Note: Body validation is handled by middleware
   */
  registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Body is already validated and transformed to CreateUserDto by middleware
      const createUserDto = req.body as CreateUserDto;
      const result = await this.userService.registerUser(createUserDto);

      if (result.success && result.data) {
        // Return 200 for both new registration and existing user login
        res.sendSuccess(result.data, result.message || 'Success', 200);
      } else {
        res.sendError(result.error || 'Failed to register user', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/me
   * Get current authenticated user's profile
   * Requires authentication middleware
   * Note: req.user is set by authenticate middleware
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is guaranteed to exist because authenticate middleware runs before this
      if (!req.user) {
        res.sendError('User not authenticated', 401);
        return;
      }

      res.sendSuccess(new UserResponseDto(req.user), 'User profile retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:id
   * Get user by ID (admin only)
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.sendError('Invalid user ID', 400);
        return;
      }

      const result = await this.userService.getUserById(id);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message, 200);
      } else {
        res.sendError(result.error || 'User not found', 404);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users
   * Get all users (admin only)
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.getAllUsers();

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Users retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve users', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id
   * Update user (admin only)
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.sendError('Invalid user ID', 400);
        return;
      }

      const updateData = req.body;
      const result = await this.userService.updateUser(id, updateData);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'User updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update user', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/role
   * Update user role (admin only)
   */
  updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.sendError('Invalid user ID', 400);
        return;
      }

      const { role } = req.body;
      if (!role) {
        res.sendError('Role is required', 400);
        return;
      }

      const result = await this.userService.updateUserRole(id, role);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'User role updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update user role', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/status
   * Update user status (admin only)
   */
  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.sendError('Invalid user ID', 400);
        return;
      }

      const { status } = req.body;
      if (!status) {
        res.sendError('Status is required', 400);
        return;
      }

      const result = await this.userService.updateUserStatus(id, status);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'User status updated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to update user status', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/create-admin
   * Create initial admin account (one-time, requires API key)
   */
  createAdminAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createAdminDto = req.body as CreateAdminDto;
      const result = await this.userService.createAdminAccount(createAdminDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Admin account created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create admin account', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/volunteer-club-users
   * Create volunteer club user account (admin only)
   */
  createVolunteerClubUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createDto = req.body as CreateVolunteerClubUserDto;
      const result = await this.userService.createVolunteerClubUser(createDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Volunteer club user created successfully', 201);
      } else {
        res.sendError(result.error || 'Failed to create volunteer club user', 400);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/:id/generate-password
   * Generate a new password for a user (admin only)
   */
  generatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.sendError('Invalid user ID', 400);
        return;
      }

      const result = await this.userService.generatePasswordForUser(id);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Password generated successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to generate password', 400);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;

