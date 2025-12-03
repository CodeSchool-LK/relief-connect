import { IsString, IsOptional, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { BaseDto } from '../common/base_dto';
import { IBodyDto } from '../../interfaces';
import { UserStatus } from '../../enums';

/**
 * DTO for updating system administrator details
 */
export class UpdateSystemAdminDto extends BaseDto implements IBodyDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Contact number must not exceed 50 characters' })
  @Matches(/^[+]?[\d\s-()]+$/, { message: 'Contact number format is invalid' })
  contactNumber?: string;

  @IsEnum(UserStatus, { message: 'Status must be a valid user status' })
  @IsOptional()
  status?: UserStatus;
}

