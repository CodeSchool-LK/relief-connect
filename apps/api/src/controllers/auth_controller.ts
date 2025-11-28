import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { LoginDto, RefreshTokenDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Controller for Auth endpoints
 * Handles HTTP requests and responses for authentication
 */
class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * POST /api/auth/login
   * Login user with username and optional password
   * Note: Body validation is handled by middleware
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Body is already validated and transformed to LoginDto by middleware
      const loginDto = req.body as LoginDto;
      const result = await this.authService.login(loginDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Login successful', 200);
      } else {
        res.sendError(result.error || 'Failed to login', 401);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   * Note: Body validation is handled by middleware
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Body is already validated and transformed to RefreshTokenDto by middleware
      const refreshTokenDto = req.body as RefreshTokenDto;
      const result = await this.authService.refreshToken(refreshTokenDto);

      if (result.success && result.data) {
        res.sendSuccess(result.data, result.message || 'Token refreshed successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to refresh token', 401);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;

