import { IsNumber, IsString, IsOptional, IsEnum, IsArray, Length, Min, Max, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { CampType, PeopleRange, CampNeed, ContactType, CampStatus, RationItemType } from '../../../enums';

/**
 * DTO for updating a camp
 * All fields are optional for partial updates
 */
export class UpdateCampDto extends BaseDto implements IBodyDto {
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

  @IsEnum(CampType, { message: 'Camp type must be Official or Community' })
  @IsOptional()
  campType?: CampType;

  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name?: string;

  @IsEnum(PeopleRange, { message: 'People range must be 1-10, 10-50, or 50+' })
  @IsOptional()
  peopleRange?: PeopleRange;

  @IsArray({ message: 'Needs must be an array' })
  @IsOptional()
  @ArrayMinSize(1, { message: 'At least one need must be specified' })
  @IsEnum(CampNeed, { each: true, message: 'Each need must be a valid camp need' })
  needs?: CampNeed[];

  @IsString({ message: 'Short note must be a string' })
  @IsOptional()
  @Length(1, 500, { message: 'Short note must be between 1 and 500 characters' })
  shortNote?: string;

  @IsEnum(ContactType, { message: 'Contact type must be Phone, WhatsApp, or None' })
  @IsOptional()
  contactType?: ContactType;

  @IsString({ message: 'Contact must be a string' })
  @IsOptional()
  @Length(0, 50, { message: 'Contact must not exceed 50 characters' })
  contact?: string;

  @IsNumber({}, { message: 'People count must be a number' })
  @IsOptional()
  @Min(1, { message: 'People count must be at least 1' })
  peopleCount?: number;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @Length(0, 2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsString({ message: 'Location must be a string' })
  @IsOptional()
  @Length(0, 500, { message: 'Location must not exceed 500 characters' })
  location?: string;

  @IsEnum(CampStatus, { message: 'Invalid camp status' })
  @IsOptional()
  status?: CampStatus;

  @IsArray({ message: 'Items must be an array' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CampItemDto)
  items?: CampItemDto[];

  @IsArray({ message: 'Drop-off locations must be an array' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CampDropOffLocationDto)
  dropOffLocations?: CampDropOffLocationDto[];

  @IsArray({ message: 'Help request IDs must be an array' })
  @IsOptional()
  @IsNumber({}, { each: true, message: 'Each help request ID must be a number' })
  helpRequestIds?: number[];

  @IsArray({ message: 'Donation IDs must be an array' })
  @IsOptional()
  @IsNumber({}, { each: true, message: 'Each donation ID must be a number' })
  donationIds?: number[];
}

/**
 * Nested DTO for camp items
 */
class CampItemDto {
  @IsEnum(RationItemType, { message: 'Item type must be a valid ration item type' })
  @IsOptional()
  itemType?: RationItemType;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsOptional()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity?: number;

  @IsString({ message: 'Notes must be a string' })
  @IsOptional()
  notes?: string;
}

/**
 * Nested DTO for camp drop-off locations
 */
class CampDropOffLocationDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name?: string;

  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  @Length(0, 500, { message: 'Address must not exceed 500 characters' })
  address?: string;

  @IsString({ message: 'Latitude must be a string' })
  @IsOptional()
  lat?: string;

  @IsString({ message: 'Longitude must be a string' })
  @IsOptional()
  lng?: string;

  @IsString({ message: 'Contact number must be a string' })
  @IsOptional()
  @Length(0, 50, { message: 'Contact number must not exceed 50 characters' })
  contactNumber?: string;

  @IsString({ message: 'Notes must be a string' })
  @IsOptional()
  notes?: string;

  @IsString({ message: 'Drop-off start date must be a string' })
  @IsOptional()
  dropOffStartDate?: string;

  @IsString({ message: 'Drop-off end date must be a string' })
  @IsOptional()
  dropOffEndDate?: string;

  @IsString({ message: 'Drop-off start time must be a string' })
  @IsOptional()
  @Length(0, 10, { message: 'Drop-off start time must not exceed 10 characters' })
  dropOffStartTime?: string;

  @IsString({ message: 'Drop-off end time must be a string' })
  @IsOptional()
  @Length(0, 10, { message: 'Drop-off end time must not exceed 10 characters' })
  dropOffEndTime?: string;
}

