import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { BaseDto } from '../common/base_dto';
import { IBodyDto } from '../../interfaces';

/**
 * DTO for creating the initial admin account
 * Requires API key for security
 */
export class CreateAdminDto extends BaseDto implements IBodyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  apiKey!: string;
}

