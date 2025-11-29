import { IsNumber, IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, Length, Min, Max, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ICreateCamp } from '../../../interfaces/camp/ICreateCamp';
import { CampType, PeopleRange, CampNeed, ContactType, RationItemType } from '../../../enums';

/**
 * DTO for creating a new camp
 * Backend DTO with validation decorators
 * Frontend should use ICreateCamp interface instead
 */
export class CreateCampDto extends BaseDto implements IBodyDto, ICreateCamp {
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  lat!: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  lng!: number;

  @IsEnum(CampType, { message: 'Camp type must be Official or Community' })
  @IsNotEmpty({ message: 'Camp type is required' })
  campType!: CampType;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name!: string;

  @IsEnum(PeopleRange, { message: 'People range must be 1-10, 10-50, or 50+' })
  @IsNotEmpty({ message: 'People range is required' })
  peopleRange!: PeopleRange;

  @IsArray({ message: 'Needs must be an array' })
  @ArrayMinSize(1, { message: 'At least one need must be specified' })
  @IsEnum(CampNeed, { each: true, message: 'Each need must be a valid camp need' })
  needs!: CampNeed[];

  @IsString({ message: 'Short note must be a string' })
  @IsNotEmpty({ message: 'Short note is required' })
  @Length(1, 500, { message: 'Short note must be between 1 and 500 characters' })
  shortNote!: string;

  @IsEnum(ContactType, { message: 'Contact type must be Phone, WhatsApp, or None' })
  @IsNotEmpty({ message: 'Contact type is required' })
  contactType!: ContactType;

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

  constructor(data?: Partial<ICreateCamp>) {
    super();
    if (data) {
      this.lat = data.lat || 0;
      this.lng = data.lng || 0;
      this.campType = data.campType!;
      this.name = data.name || '';
      this.peopleRange = data.peopleRange!;
      this.needs = data.needs || [];
      this.shortNote = data.shortNote || '';
      this.contactType = data.contactType!;
      this.contact = data.contact;
      this.peopleCount = data.peopleCount;
      this.description = data.description;
      this.location = data.location;
      this.items = data.items;
      this.dropOffLocations = data.dropOffLocations;
      this.helpRequestIds = data.helpRequestIds;
      this.donationIds = data.donationIds;
    }
  }
}

/**
 * Nested DTO for camp items
 */
class CampItemDto {
  @IsEnum(RationItemType, { message: 'Item type must be a valid ration item type' })
  @IsNotEmpty({ message: 'Item type is required' })
  itemType!: RationItemType;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;

  @IsString({ message: 'Notes must be a string' })
  @IsOptional()
  notes?: string;
}

/**
 * Nested DTO for camp drop-off locations
 */
class CampDropOffLocationDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name!: string;

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
}

