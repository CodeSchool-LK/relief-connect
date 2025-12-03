import UserModel from '../models/user.model';
import { 
  IUser, 
  UserRole,
  UserStatus
} from '@nx-mono-repo-deployment-test/shared';
import { PasswordUtil } from '../utils';

class UserDao {
  private static instance: UserDao;

  private constructor() {}

  public static getInstance(): UserDao {
    if (!UserDao.instance) {
      UserDao.instance = new UserDao();
    }
    return UserDao.instance;
  }

  /**
   * Find user by username
   */
  public async findByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({
        where: {
          [UserModel.USER_USERNAME]: username,
        },
      });
      return user ? (user.toJSON() as IUser) : null;
    } catch (error) {
      console.error(`Error in UserDao.findByUsername (${username}):`, error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  public async findById(id: number): Promise<IUser | null> {
    try {
      const user = await UserModel.findByPk(id);
      return user ? (user.toJSON() as IUser) : null;
    } catch (error) {
      console.error(`Error in UserDao.findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param userData - User creation data (Partial<IUser> with username required, optional password, contactNumber, role, status, permissions)
   * @param role - User role (defaults to USER, set by service layer for security) - overrides userData.role if provided
   */
  public async create(userData: Partial<IUser> & { username: string }, role?: UserRole): Promise<IUser> {
    try {
      if (!userData.username) {
        throw new Error('Username is required');
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (userData.password) {
        hashedPassword = await PasswordUtil.hashPassword(userData.password);
      }

      // Use provided role or fall back to userData.role or default to USER
      const userRole = role || userData.role || UserRole.USER;
      // Use provided status or default to ACTIVE
      const userStatus = userData.status || UserStatus.ACTIVE;

      const user = await UserModel.create({
        [UserModel.USER_USERNAME]: userData.username,
        [UserModel.USER_PASSWORD]: hashedPassword,
        [UserModel.USER_CONTACT_NUMBER]: userData.contactNumber?.trim(),
        [UserModel.USER_ROLE]: userRole,
        [UserModel.USER_STATUS]: userStatus,
        [UserModel.USER_PERMISSIONS]: userData.permissions || [],
      });
      return user.toJSON() as IUser;
    } catch (error) {
      console.error('Error in UserDao.create:', error);
      throw error;
    }
  }

  /**
   * Check if username already exists
   */
  public async usernameExists(username: string): Promise<boolean> {
    try {
      const count = await UserModel.count({
        where: {
          [UserModel.USER_USERNAME]: username,
        },
      });
      return count > 0;
    } catch (error) {
      console.error(`Error in UserDao.usernameExists (${username}):`, error);
      throw error;
    }
  }

  /**
   * Find all users
   */
  public async findAll(): Promise<IUser[]> {
    try {
      const users = await UserModel.findAll({
        order: [['createdAt', 'DESC']],
      });
      return users.map(user => user.toJSON() as IUser);
    } catch (error) {
      console.error('Error in UserDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Find system administrators with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Object with data array and total count
   */
  public async findSystemAdministrators(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: IUser[]; total: number }> {
    try {
      const whereClause = {
        [UserModel.USER_ROLE]: UserRole.SYSTEM_ADMINISTRATOR,
      };

      // Get total count
      const total = await UserModel.count({ where: whereClause });

      // Calculate offset
      const offset = (page - 1) * limit;

      // Fetch paginated results
      const users = await UserModel.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        data: users.map(user => user.toJSON() as IUser),
        total,
      };
    } catch (error) {
      console.error('Error in UserDao.findSystemAdministrators:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  public async update(id: number, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      const user = await UserModel.findByPk(id);
      if (!user) {
        return null;
      }

      await user.update(updateData);
      return user.toJSON() as IUser;
    } catch (error) {
      console.error(`Error in UserDao.update (${id}):`, error);
      throw error;
    }
  }
}

export default UserDao;

