import { UserDao, RefreshTokenDao } from '../dao';
import { CreateUserDto, UserResponseDto, LoginResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { UserRole, UserStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IApiResponse, IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { JwtUtil, PasswordUtil } from '../utils';

/**
 * Service layer for User business logic
 * Handles validation and business rules
 */
class UserService {
  private static instance: UserService;
  private userDao: UserDao;
  private refreshTokenDao: RefreshTokenDao;

  private constructor(userDao: UserDao, refreshTokenDao: RefreshTokenDao) {
    this.userDao = userDao;
    this.refreshTokenDao = refreshTokenDao;
  }

  /**
   * Get UserService singleton instance
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(
        UserDao.getInstance(),
        RefreshTokenDao.getInstance()
      );
    }
    return UserService.instance;
  }

  /**
   * Register a new user or login if username exists
   * Always returns login response with tokens
   */
  public async registerUser(createUserDto: CreateUserDto): Promise<IApiResponse<LoginResponseDto>> {
    try {
      // Validate username format (trim and check length)
      const trimmedUsername = createUserDto.username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
        return {
          success: false,
          error: 'Username must be between 3 and 50 characters',
        };
      }

      // Validate password if provided
      if (createUserDto.password !== undefined && createUserDto.password !== null) {
        if (createUserDto.password.length < 6) {
          return {
            success: false,
            error: 'Password must be at least 6 characters if provided',
          };
        }
      }

      // Check if username already exists
      const existingUser = await this.userDao.findByUsername(trimmedUsername);
      
      let user;
      if (existingUser) {
        // User exists - login them in
        // Check if user account is active
        if (existingUser.status !== UserStatus.ACTIVE) {
          return {
            success: false,
            error: 'Account is disabled. Please contact administrator',
          };
        }

        // If existing user has a password, validate it
        if (existingUser.password) {
          if (!createUserDto.password) {
            return {
              success: false,
              error: 'Password is required for this account',
            };
          }

          // Compare provided password with stored hash
          const isPasswordValid = await PasswordUtil.comparePassword(
            createUserDto.password,
            existingUser.password
          );

          if (!isPasswordValid) {
            return {
              success: false,
              error: 'Invalid username or password',
            };
          }
        }

        user = existingUser;
      } else {
        // User doesn't exist - create new user
        // Role is always set to USER - never accept role from frontend for security
        const role = UserRole.USER;

        // Business logic: Create trimmed DTO
        const trimmedDto = new CreateUserDto({
          username: trimmedUsername,
          password: createUserDto.password,
        });

        user = await this.userDao.create(trimmedDto, role);
      }

      // Generate access and refresh tokens (same as login)
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
        message: existingUser ? 'Login successful' : 'User registered successfully',
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error in UserService.registerUser:', error);
      
      // Handle unique constraint violation
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          error: 'Username already exists',
        };
      }

      return {
        success: false,
        error: 'Failed to register user',
      };
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: number): Promise<IApiResponse<UserResponseDto>> {
    try {
      const user = await this.userDao.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: new UserResponseDto(user),
      };
    } catch (error) {
      console.error(`Error in UserService.getUserById (${id}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve user',
      };
    }
  }

  /**
   * Get user by username
   */
  public async getUserByUsername(username: string): Promise<IApiResponse<UserResponseDto>> {
    try {
      const user = await this.userDao.findByUsername(username);

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: new UserResponseDto(user),
      };
    } catch (error) {
      console.error(`Error in UserService.getUserByUsername (${username}):`, error);
      return {
        success: false,
        error: 'Failed to retrieve user',
      };
    }
  }

  /**
   * Get all users (admin only)
   */
  public async getAllUsers(): Promise<IApiResponse<UserResponseDto[]>> {
    try {
      const users = await this.userDao.findAll();
      return {
        success: true,
        data: users.map(user => new UserResponseDto(user)),
      };
    } catch (error) {
      console.error('Error in UserService.getAllUsers:', error);
      return {
        success: false,
        error: 'Failed to retrieve users',
      };
    }
  }

  /**
   * Update user (admin only)
   */
  public async updateUser(id: number, updateData: Partial<IUser>): Promise<IApiResponse<UserResponseDto>> {
    try {
      const user = await this.userDao.update(id, updateData);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      return {
        success: true,
        data: new UserResponseDto(user),
        message: 'User updated successfully',
      };
    } catch (error) {
      console.error(`Error in UserService.updateUser (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }

  /**
   * Update user role (admin only)
   */
  public async updateUserRole(id: number, role: UserRole): Promise<IApiResponse<UserResponseDto>> {
    try {
      const user = await this.userDao.update(id, { role });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      return {
        success: true,
        data: new UserResponseDto(user),
        message: 'User role updated successfully',
      };
    } catch (error) {
      console.error(`Error in UserService.updateUserRole (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update user role',
      };
    }
  }

  /**
   * Update user status (admin only)
   */
  public async updateUserStatus(id: number, status: UserStatus): Promise<IApiResponse<UserResponseDto>> {
    try {
      const user = await this.userDao.update(id, { status });
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }
      return {
        success: true,
        data: new UserResponseDto(user),
        message: 'User status updated successfully',
      };
    } catch (error) {
      console.error(`Error in UserService.updateUserStatus (${id}):`, error);
      return {
        success: false,
        error: 'Failed to update user status',
      };
    }
  }
}

export default UserService;

