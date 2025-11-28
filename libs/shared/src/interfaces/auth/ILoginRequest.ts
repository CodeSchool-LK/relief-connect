/**
 * Frontend interface for user login
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface ILoginRequest {
  username: string;
  password?: string; // Optional - if user has no password, login without password check
}

