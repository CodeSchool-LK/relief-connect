/**
 * Frontend interface for creating a new user
 * This is a plain interface without decorators to avoid issues in frontend builds
 * Note: Role is not accepted from frontend - it's always set to USER by the backend
 */
export interface ICreateUserRequest {
  username: string;
  password?: string; // Optional - users can register without password
}

