import { IsArray, ValidateNested, ArrayMinSize, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { UpdateSystemSettingDto } from './update-system-setting.dto';

class SettingUpdate {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

/**
 * DTO for bulk updating system settings
 */
export class BulkUpdateSettingsDto extends BaseDto implements IBodyDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Settings array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => SettingUpdate)
  settings!: SettingUpdate[];
}

