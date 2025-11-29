import { IsString, IsNotEmpty, MinLength, IsOptional, Length, IsEmail } from 'class-validator';
import { BaseDto } from '../common/base_dto';
import { IBodyDto } from '../../interfaces';

/**
 * DTO for creating a volunteer club user account (admin only)
 * Also creates a volunteer club entity associated with the user
 */
export class CreateVolunteerClubUserDto extends BaseDto implements IBodyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username!: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string; // If not provided, a password will be generated

  // Volunteer club information
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  clubName!: string; // Name of the volunteer club

  @IsString()
  @IsOptional()
  clubDescription?: string;

  @IsString()
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  clubEmail?: string;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  clubAddress?: string;
}

