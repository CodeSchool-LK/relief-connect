import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { BaseDto } from '../common/base_dto';
import { IBodyDto } from '../../interfaces';
import { Permission } from '../../enums';

/**
 * DTO for updating system administrator permissions
 */
export class UpdatePermissionsDto extends BaseDto implements IBodyDto {
  @IsArray({ message: 'Permissions must be an array' })
  @ArrayMinSize(1, { message: 'Permissions array cannot be empty' })
  @IsEnum(Permission, { each: true, message: 'Each permission must be a valid Permission enum value' })
  permissions!: Permission[];
}

