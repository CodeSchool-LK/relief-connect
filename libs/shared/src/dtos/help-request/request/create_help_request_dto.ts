import { IsNumber, IsString, IsNotEmpty, IsOptional, IsEnum, Length, Min, Max, IsArray, ArrayMinSize } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ICreateHelpRequest } from '../../../interfaces/help-request/ICreateHelpRequest';
import { HelpRequestCategory, Urgency, ContactType } from '../../../enums';

/**
 * DTO for creating a new help request
 * Backend DTO with validation decorators
 * Frontend should use ICreateHelpRequest interface instead
 */
export class CreateHelpRequestDto extends BaseDto implements IBodyDto, ICreateHelpRequest {
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  lat!: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  lng!: number;

  @IsEnum(HelpRequestCategory, { message: 'Category must be a valid category' })
  @IsNotEmpty({ message: 'Category is required' })
  category!: HelpRequestCategory;

  @IsEnum(Urgency, { message: 'Urgency must be Low, Medium, or High' })
  @IsNotEmpty({ message: 'Urgency is required' })
  urgency!: Urgency;

  @IsString({ message: 'Short note must be a string' })
  @IsNotEmpty({ message: 'Short note is required' })
  @Length(1, 160, { message: 'Short note must be between 1 and 160 characters' })
  shortNote!: string;

  @IsString({ message: 'Approximate area must be a string' })
  @IsNotEmpty({ message: 'Approximate area is required' })
  @Length(1, 255, { message: 'Approximate area must not exceed 255 characters' })
  approxArea!: string;

  @IsEnum(ContactType, { message: 'Contact type must be Phone, WhatsApp, or None' })
  @IsNotEmpty({ message: 'Contact type is required' })
  contactType!: ContactType;

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

  @IsArray({ message: 'Ration items must be an array' })
  @IsOptional()
  @IsString({ each: true, message: 'Each ration item must be a string' })
  rationItems?: string[];

  constructor(data?: Partial<ICreateHelpRequest>) {
    super();
    if (data) {
      this.lat = data.lat || 0;
      this.lng = data.lng || 0;
      this.category = data.category!;
      this.urgency = data.urgency!;
      this.shortNote = data.shortNote || '';
      this.approxArea = data.approxArea || '';
      this.contactType = data.contactType!;
      this.contact = data.contact;
      this.name = data.name;
      this.totalPeople = data.totalPeople;
      this.elders = data.elders;
      this.children = data.children;
      this.pets = data.pets;
      this.rationItems = data.rationItems;
    }
  }
}

