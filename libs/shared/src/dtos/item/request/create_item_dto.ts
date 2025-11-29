import { IsString, IsNotEmpty, IsOptional, Length, IsEnum } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ICreateItemRequest } from '../../../interfaces/item/ICreateItemRequest';
import { RationItemType } from '../../../enums/ration-item.enum';

/**
 * DTO for creating a new item
 * Backend DTO with validation decorators
 * Frontend should use ICreateItemRequest interface instead
 */
export class CreateItemDto extends BaseDto implements IBodyDto, ICreateItemRequest {
  @IsEnum(RationItemType, { message: 'Code must be a valid RationItemType' })
  @IsNotEmpty({ message: 'Code is required' })
  code!: RationItemType;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name!: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @Length(0, 1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  constructor(data?: { code?: RationItemType; name?: string; description?: string }) {
    super();
    if (data) {
      this.code = data.code!;
      this.name = data.name || '';
      this.description = data.description;
    }
  }
}

