import { IsNumber, IsString, IsOptional, IsEnum, Length, Min, Max, IsObject } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { Urgency, ContactType, HelpRequestStatus } from '../../../enums';

/**
 * DTO for updating a help request
 * All fields are optional for partial updates
 */
export class UpdateHelpRequestDto extends BaseDto implements IBodyDto {
  @IsNumber({}, { message: 'Latitude must be a number' })
  @IsOptional()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  lat?: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @IsOptional()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  lng?: number;

  @IsEnum(Urgency, { message: 'Urgency must be Low, Medium, or High' })
  @IsOptional()
  urgency?: Urgency;

  @IsString({ message: 'Short note must be a string' })
  @IsOptional()
  @Length(1, 160, { message: 'Short note must be between 1 and 160 characters' })
  shortNote?: string;

  @IsString({ message: 'Approximate area must be a string' })
  @IsOptional()
  @Length(1, 255, { message: 'Approximate area must not exceed 255 characters' })
  approxArea?: string;

  @IsEnum(ContactType, { message: 'Contact type must be Phone, WhatsApp, or None' })
  @IsOptional()
  contactType?: ContactType;

  @IsString({ message: 'Contact must be a string' })
  @IsOptional()
  @Length(0, 50, { message: 'Contact must not exceed 50 characters' })
  contact?: string;

  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @Length(0, 100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @IsNumber({}, { message: 'Total people must be a number' })
  @IsOptional()
  @Min(0, { message: 'Total people must be 0 or greater' })
  totalPeople?: number;

  @IsNumber({}, { message: 'Elders must be a number' })
  @IsOptional()
  @Min(0, { message: 'Elders must be 0 or greater' })
  elders?: number;

  @IsNumber({}, { message: 'Children must be a number' })
  @IsOptional()
  @Min(0, { message: 'Children must be 0 or greater' })
  children?: number;

  @IsNumber({}, { message: 'Pets must be a number' })
  @IsOptional()
  @Min(0, { message: 'Pets must be 0 or greater' })
  pets?: number;

  @IsObject({ message: 'Ration items must be an object with item codes as keys and quantities as values' })
  @IsOptional()
  rationItems?: Record<string, number>;

  @IsEnum(HelpRequestStatus, { message: 'Invalid help request status' })
  @IsOptional()
  status?: HelpRequestStatus;
}

