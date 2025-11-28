import { UserDao, RefreshTokenDao } from '../dao';
import { LoginDto, LoginResponseDto, RefreshTokenDto, UserResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { UserStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { JwtUtil } from '../utils';
import { PasswordUtil } from '../utils';

/**
 * Service layer for Authentication business logic
 * Handles login and authentication
 */
class AuthService {
  private static instance: AuthService;
  private userDao: UserDao;
  private refreshTokenDao: RefreshTokenDao;

  private constructor(userDao: UserDao, refreshTokenDao: RefreshTokenDao) {
    this.userDao = userDao;
    this.refreshTokenDao = refreshTokenDao;
  }

  /**
   * Get AuthService singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(
        UserDao.getInstance(),
        RefreshTokenDao.getInstance()
      );
    }
    return AuthService.instance;
  }

  /**
   * Login user with username and optional password
   * - If user has no password: allow login without password check
   * - If user has password: compare provided password with stored password
   */
  public async login(loginDto: LoginDto): Promise<IApiResponse<LoginResponseDto>> {
    try {
      // Find user by username
      const user = await this.userDao.findByUsername(loginDto.username);

      if (!user) {
        return {
          success: false,
          error: 'Invalid username or password',
        };
      }

      // Check if user account is active
      if (user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          error: 'Account is disabled. Please contact administrator',
        };
      }

      // Password validation logic
      if (user.password) {
        // User has a password set - must provide correct password
        if (!loginDto.password) {
          return {
            success: false,
            error: 'Password is required for this account',
          };
        }

        // Compare provided password with stored hash
        const isPasswordValid = await PasswordUtil.comparePassword(
          loginDto.password,
          user.password
        );

        if (!isPasswordValid) {
          return {
            success: false,
            error: 'Invalid username or password',
          };
        }
      } else {
        // User has no password set - allow login without password check
        // This is intentional - users can register without password and login without it
      }

      // Generate access and refresh tokens
      const accessToken = JwtUtil.generateAccessToken(user);
      const refreshToken = JwtUtil.generateRefreshToken(user);

      // Calculate refresh token expiration (7 days from now)
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

      // Store refresh token in database
      await this.refreshTokenDao.create(user.id!, refreshToken, refreshTokenExpiresAt);

      // Create login response
      const loginResponse = {
        user: new UserResponseDto(user),
        accessToken: accessToken,
        refreshToken: refreshToken,
      };

      return {
        success: true,
        data: new LoginResponseDto(loginResponse),
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Error in AuthService.login:', error);
      return {
        success: false,
        error: 'Failed to login',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<IApiResponse<LoginResponseDto>> {
    try {
      // Verify refresh token
      const decoded = JwtUtil.verifyRefreshToken(refreshTokenDto.refreshToken);
      
      if (!decoded) {
        return {
          success: false,
          error: 'Invalid or expired refresh token',
        };
      }

      // Check if refresh token exists in database
      const storedToken = await this.refreshTokenDao.findByToken(refreshTokenDto.refreshToken);
      
      if (!storedToken) {
        return {
          success: false,
          error: 'Refresh token not found or expired',
        };
      }

      // Get user from database
      if (!decoded.id) {
        return {
          success: false,
          error: 'Invalid token payload',
        };
      }
      
      const user = await this.userDao.findById(decoded.id);

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Check if user account is active
      if (user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          error: 'Account is disabled. Please contact administrator',
        };
      }

      // Generate new access token
      const accessToken = JwtUtil.generateAccessToken(user);

      // Optionally rotate refresh token (generate new one and delete old)
      const newRefreshToken = JwtUtil.generateRefreshToken(user);
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

      // Delete old refresh token
      await this.refreshTokenDao.deleteToken(refreshTokenDto.refreshToken);

      // Store new refresh token
      await this.refreshTokenDao.create(user.id!, newRefreshToken, refreshTokenExpiresAt);

      // Create response with new tokens
      const loginResponse = {
        user: new UserResponseDto(user),
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      };

      return {
        success: true,
        data: new LoginResponseDto(loginResponse),
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      console.error('Error in AuthService.refreshToken:', error);
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }
  }
}

export default AuthService;

