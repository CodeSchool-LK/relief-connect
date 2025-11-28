import { IUser } from '../user/IUser';

/**
 * Login response interface
 */
export interface ILoginResponse {
  user: Omit<IUser, 'password'>; // User data without password
  accessToken: string; // JWT access token (short-lived)
  refreshToken: string; // JWT refresh token (long-lived)
}

