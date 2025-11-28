import { IUser } from '../../../interfaces/user/IUser';
import { UserRole, UserStatus } from '../../../enums';

/**
 * DTO for user response
 * Excludes password for security
 */
export class UserResponseDto implements Omit<IUser, 'password'> {
  id: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(user: IUser) {
    this.id = user.id!;
    this.username = user.username;
    this.role = user.role;
    this.status = user.status;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

