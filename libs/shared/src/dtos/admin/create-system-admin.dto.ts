import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { BaseDto } from '../common/base_dto';
import { IBodyDto } from '../../interfaces';

/**
 * DTO for creating a new system administrator
 */
export class CreateSystemAdminDto extends BaseDto implements IBodyDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Contact number must not exceed 50 characters' })
  @Matches(/^[+]?[\d\s-()]+$/, { message: 'Contact number format is invalid' })
  contactNumber?: string;
}

