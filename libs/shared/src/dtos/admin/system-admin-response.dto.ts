import { IUser } from '../../interfaces/user/IUser';
import { UserRole, UserStatus, Permission } from '../../enums';

/**
 * DTO for system administrator response
 * Includes permissions array
 */
export class SystemAdminResponseDto implements Omit<IUser, 'password'> {
  id: number;
  username: string;
  contactNumber?: string;
  role: UserRole;
  status: UserStatus;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(user: IUser) {
    this.id = user.id!;
    this.username = user.username;
    this.contactNumber = user.contactNumber;
    this.role = user.role;
    this.status = user.status;
    this.permissions = user.permissions || [];
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

