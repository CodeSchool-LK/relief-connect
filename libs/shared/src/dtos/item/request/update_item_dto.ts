import { IsString, IsOptional, IsInt, Length, ValidateIf } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { IUpdateItemRequest } from '../../../interfaces/item/IUpdateItemRequest';

/**
 * DTO for updating an existing item
 * Backend DTO with validation decorators
 * Frontend should use IUpdateItemRequest interface instead
 */
export class UpdateItemDto extends BaseDto implements IBodyDto, IUpdateItemRequest {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @Length(0, 1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  // Optional status code for conditional validation
  @IsInt({ message: 'Status code must be an integer' })
  @IsOptional()
  statusCode?: number;

  // Special notes only required when statusCode is 10 (draft status)
  @ValidateIf(o => o.statusCode === 10)
  @IsString({ message: 'Special notes must be a string' })
  @Length(1, 500, { message: 'Special notes must be between 1 and 500 characters' })
  specialNotes?: string;

  constructor(data?: { 
    name?: string; 
    description?: string; 
    statusCode?: number;
    specialNotes?: string;
  }) {
    super();
    if (data) {
      this.name = data.name;
      this.description = data.description;
      this.statusCode = data.statusCode;
      this.specialNotes = data.specialNotes;
    }
  }
}

