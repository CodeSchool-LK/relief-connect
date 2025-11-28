import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ILoginRequest } from '../../../interfaces/auth/ILoginRequest';

/**
 * DTO for user login
 * Backend DTO with validation decorators
 * Frontend should use ILoginRequest interface instead
 */
export class LoginDto extends BaseDto implements IBodyDto, ILoginRequest {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  username!: string;

  @IsString({ message: 'Password must be a string' })
  @IsOptional()
  password?: string;

  constructor(data?: Partial<ILoginRequest>) {
    super();
    if (data) {
      this.username = data.username || '';
      this.password = data.password;
    }
  }
}

