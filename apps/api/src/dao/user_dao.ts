import UserModel from '../models/user.model';
import { 
  IUser, 
  CreateUserDto,
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
   * @param createUserDto - User creation data (username, optional password)
   * @param role - User role (defaults to USER, set by service layer for security)
   */
  public async create(createUserDto: CreateUserDto, role: UserRole = UserRole.USER): Promise<IUser> {
    try {
      // Hash password if provided
      let hashedPassword: string | undefined;
      if (createUserDto.password) {
        hashedPassword = await PasswordUtil.hashPassword(createUserDto.password);
      }

      const user = await UserModel.create({
        [UserModel.USER_USERNAME]: createUserDto.username,
        [UserModel.USER_PASSWORD]: hashedPassword,
        [UserModel.USER_ROLE]: role,
        [UserModel.USER_STATUS]: UserStatus.ACTIVE,
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
}

export default UserDao;

