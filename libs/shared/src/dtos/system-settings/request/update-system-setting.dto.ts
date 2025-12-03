import { IsString, IsOptional, IsEnum } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { SystemSettingType } from '../../../enums/system-setting-type.enum';

/**
 * DTO for updating a system setting
 * 
 * The type field is needed to:
 * - Validate the value format (e.g., ensure number values are numeric, boolean values are true/false)
 * - Parse the value correctly when retrieving settings (convert string to number/boolean/json)
 * - Provide type information to the frontend for proper UI rendering
 */
export class UpdateSystemSettingDto extends BaseDto implements IBodyDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsEnum(SystemSettingType, { message: 'Type must be string, number, boolean, or json' })
  @IsOptional()
  type?: SystemSettingType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

