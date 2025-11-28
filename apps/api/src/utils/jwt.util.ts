import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces/user/IUser';
import { appConfig } from '../config';

/**
 * JWT token payload interface
 */
interface TokenPayload extends JwtPayload {
  id?: number;
  username?: string;
  role?: string;
  type: 'access' | 'refresh';
}

/**
 * JWT utility for token generation and verification
 */
class JwtUtil {
  private static readonly SECRET_KEY: string = appConfig.jwt.secret;
  private static readonly ACCESS_TOKEN_EXPIRES_IN: string = appConfig.jwt.accessTokenExpiresIn;
  private static readonly REFRESH_TOKEN_EXPIRES_IN: string = appConfig.jwt.refreshTokenExpiresIn;
  private static readonly REFRESH_TOKEN_SECRET: string = appConfig.jwt.refreshSecret;

  /**
   * Generate access token for user (short-lived)
   * @param user - User object (password will be excluded)
   * @returns JWT access token string
   */
  public static generateAccessToken(user: IUser): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      type: 'access',
    };

    return jwt.sign(payload, this.SECRET_KEY, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    } as SignOptions);
  }

  /**
   * Generate refresh token for user (long-lived)
   * @param user - User object (password will be excluded)
   * @returns JWT refresh token string
   */
  public static generateRefreshToken(user: IUser): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      type: 'refresh',
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions);
  }

  /**
   * Verify access token
   * @param token - JWT access token string
   * @returns Decoded token payload or null if invalid
   */
  public static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.SECRET_KEY) as TokenPayload;
      if (decoded.type !== 'access') {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT refresh token string
   * @returns Decoded token payload or null if invalid
   */
  public static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
      if (decoded.type !== 'refresh') {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   * @param token - JWT token string
   * @returns Decoded token payload or null
   */
  public static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as TokenPayload | null;
    } catch (error) {
      return null;
    }
  }
}

export default JwtUtil;

