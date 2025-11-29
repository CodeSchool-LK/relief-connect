import { IsString, IsOptional, Length, IsEmail } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for updating a volunteer club
 */
export class UpdateVolunteerClubDto extends BaseDto implements IBodyDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Contact number must be a string' })
  @IsOptional()
  @Length(8, 20, { message: 'Contact number must be between 8 and 20 characters' })
  contactNumber?: string;

  @IsString({ message: 'Email must be a string' })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Length(1, 255, { message: 'Email must be between 1 and 255 characters' })
  email?: string;

  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  @Length(1, 500, { message: 'Address must be between 1 and 500 characters' })
  address?: string;

  @IsOptional()
  userId?: number;

  constructor(data?: Partial<UpdateVolunteerClubDto>) {
    super();
    if (data) {
      this.name = data.name;
      this.description = data.description;
      this.contactNumber = data.contactNumber;
      this.email = data.email;
      this.address = data.address;
      this.userId = data.userId;
    }
  }
}

