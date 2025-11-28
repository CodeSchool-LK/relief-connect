import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services';
import { CreateUserDto, LoginResponseDto, UserResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

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
   * Get user by ID
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
}

export default UserController;

