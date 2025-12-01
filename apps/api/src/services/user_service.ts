import { UserDao, RefreshTokenDao } from '../dao';
import { CreateUserDto, UserResponseDto, LoginResponseDto, CreateAdminDto, CreateVolunteerClubUserDto, GeneratePasswordResponseDto, CreateVolunteerClubDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';
import { UserRole, UserStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IApiResponse, IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { JwtUtil, PasswordUtil } from '../utils';
import { VolunteerClubService } from './volunteer-club_service';

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
        if (existingUser.role !== UserRole.USER) {
          return {
            success: false,
            error: 'You are not authorized to access this resource',
          };
        }
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

  /**
   * Create initial admin account (one-time, requires API key)
   * Can only be called if no admin exists
   */
  public async createAdminAccount(createAdminDto: CreateAdminDto): Promise<IApiResponse<UserResponseDto>> {
    try {
      // Check if any admin already exists
      const existingAdmins = await this.userDao.findAll();
      const hasAdmin = existingAdmins.some(
        user => user.role === UserRole.ADMIN || user.role === UserRole.SYSTEM_ADMINISTRATOR
      );

      if (hasAdmin) {
        return {
          success: false,
          error: 'Admin account already exists. This endpoint can only be used once.',
        };
      }

      // Validate username
      const trimmedUsername = createAdminDto.username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
        return {
          success: false,
          error: 'Username must be between 3 and 50 characters',
        };
      }

      // Check if username already exists
      const existingUser = await this.userDao.findByUsername(trimmedUsername);
      if (existingUser) {
        return {
          success: false,
          error: 'Username already exists',
        };
      }

      // Create admin user with SYSTEM_ADMINISTRATOR role
      const createUserDto = new CreateUserDto({
        username: trimmedUsername,
        password: createAdminDto.password,
      });

      const user = await this.userDao.create(createUserDto, UserRole.SYSTEM_ADMINISTRATOR);

      return {
        success: true,
        data: new UserResponseDto(user),
        message: 'Admin account created successfully',
      };
    } catch (error) {
      console.error('Error in UserService.createAdminAccount:', error);
      return {
        success: false,
        error: 'Failed to create admin account',
      };
    }
  }

  /**
   * Create volunteer club user account (admin only)
   * Also creates a volunteer club entity associated with the user
   * Password is optional - if not provided, one will be generated
   */
  public async createVolunteerClubUser(createDto: CreateVolunteerClubUserDto): Promise<IApiResponse<{ user: UserResponseDto; password: string }>> {
    try {
      // Validate username
      const trimmedUsername = createDto.username.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
        return {
          success: false,
          error: 'Username must be between 3 and 50 characters',
        };
      }

      // Check if username already exists
      const existingUser = await this.userDao.findByUsername(trimmedUsername);
      if (existingUser) {
        return {
          success: false,
          error: 'Username already exists',
        };
      }

      // Generate password if not provided
      let password = createDto.password;
      if (!password) {
        password = PasswordUtil.generatePassword();
      }

      // Create user with VOLUNTEER_CLUB role
      const createUserDto = new CreateUserDto({
        username: trimmedUsername,
        password: password,
        contactNumber: createDto.contactNumber,
      });

      const user = await this.userDao.create(createUserDto, UserRole.VOLUNTEER_CLUB);

      // Create volunteer club entity and associate it with the user
      const volunteerClubService = VolunteerClubService.getInstance();
      const createClubDto = new CreateVolunteerClubDto({
        name: createDto.clubName.trim(),
        description: createDto.clubDescription,
        contactNumber: createDto.contactNumber,
        email: createDto.clubEmail,
        address: createDto.clubAddress,
        userId: user.id,
      });

      const clubResult = await volunteerClubService.createVolunteerClub(createClubDto);
      if (!clubResult.success) {
        // If club creation fails, we should rollback the user creation
        // For now, log the error but still return success for user creation
        // The admin can manually create the club later
        console.error('Failed to create volunteer club for user:', clubResult.error);
      }

      return {
        success: true,
        data: {
          user: new UserResponseDto(user),
          password: password, // Return plain password so admin can share it
        },
        message: 'Volunteer club user created successfully',
      };
    } catch (error) {
      console.error('Error in UserService.createVolunteerClubUser:', error);
      return {
        success: false,
        error: 'Failed to create volunteer club user',
      };
    }
  }

  /**
   * Generate a new password for a user (admin only)
   * Returns the plain password so admin can share it
   */
  public async generatePasswordForUser(userId: number): Promise<IApiResponse<GeneratePasswordResponseDto>> {
    try {
      const user = await this.userDao.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Generate new password
      const newPassword = PasswordUtil.generatePassword();

      // Update user with new password
      const hashedPassword = await PasswordUtil.hashPassword(newPassword);
      await this.userDao.update(userId, { password: hashedPassword });

      return {
        success: true,
        data: new GeneratePasswordResponseDto(newPassword),
        message: 'Password generated successfully',
      };
    } catch (error) {
      console.error(`Error in UserService.generatePasswordForUser (${userId}):`, error);
      return {
        success: false,
        error: 'Failed to generate password',
      };
    }
  }
}

export default UserService;

