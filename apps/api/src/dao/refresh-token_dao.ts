import RefreshTokenModel from '../models/refresh-token.model';
import { Op } from 'sequelize';

class RefreshTokenDao {
  private static instance: RefreshTokenDao;

  private constructor() {}

  public static getInstance(): RefreshTokenDao {
    if (!RefreshTokenDao.instance) {
      RefreshTokenDao.instance = new RefreshTokenDao();
    }
    return RefreshTokenDao.instance;
  }

  /**
   * Create a new refresh token
   */
  public async create(userId: number, token: string, expiresAt: Date): Promise<RefreshTokenModel> {
    try {
      const refreshToken = await RefreshTokenModel.create({
        [RefreshTokenModel.REFRESH_TOKEN_USER_ID]: userId,
        [RefreshTokenModel.REFRESH_TOKEN_TOKEN]: token,
        [RefreshTokenModel.REFRESH_TOKEN_EXPIRES_AT]: expiresAt,
      });
      return refreshToken;
    } catch (error) {
      console.error('Error in RefreshTokenDao.create:', error);
      throw error;
    }
  }

  /**
   * Find refresh token by token string
   */
  public async findByToken(token: string): Promise<RefreshTokenModel | null> {
    try {
      const refreshToken = await RefreshTokenModel.findOne({
        where: {
          [RefreshTokenModel.REFRESH_TOKEN_TOKEN]: token,
          [RefreshTokenModel.REFRESH_TOKEN_EXPIRES_AT]: {
            [Op.gt]: new Date(), // Token must not be expired
          },
        },
        include: ['user'],
      });
      return refreshToken;
    } catch (error) {
      console.error('Error in RefreshTokenDao.findByToken:', error);
      throw error;
    }
  }

  /**
   * Delete refresh token (logout)
   */
  public async deleteToken(token: string): Promise<void> {
    try {
      await RefreshTokenModel.destroy({
        where: {
          [RefreshTokenModel.REFRESH_TOKEN_TOKEN]: token,
        },
      });
    } catch (error) {
      console.error('Error in RefreshTokenDao.deleteToken:', error);
      throw error;
    }
  }

  /**
   * Delete all refresh tokens for a user
   */
  public async deleteAllUserTokens(userId: number): Promise<void> {
    try {
      await RefreshTokenModel.destroy({
        where: {
          [RefreshTokenModel.REFRESH_TOKEN_USER_ID]: userId,
        },
      });
    } catch (error) {
      console.error('Error in RefreshTokenDao.deleteAllUserTokens:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens
   */
  public async cleanupExpiredTokens(): Promise<number> {
    try {
      const deletedCount = await RefreshTokenModel.destroy({
        where: {
          [RefreshTokenModel.REFRESH_TOKEN_EXPIRES_AT]: {
            [Op.lt]: new Date(),
          },
        },
      });
      return deletedCount;
    } catch (error) {
      console.error('Error in RefreshTokenDao.cleanupExpiredTokens:', error);
      throw error;
    }
  }
}

export default RefreshTokenDao;


