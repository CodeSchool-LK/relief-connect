import { ISystemSetting } from '../../../interfaces/system-setting/ISystemSetting';
import { SystemSettingType } from '../../../enums/system-setting-type.enum';

/**
 * DTO for system setting response
 */
export class SystemSettingResponseDto implements ISystemSetting {
  id: number;
  key: string;
  value: string;
  type: SystemSettingType;
  description?: string;
  category?: string;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(setting: ISystemSetting) {
    this.id = setting.id!;
    this.key = setting.key;
    this.value = setting.value;
    this.type = setting.type;
    this.description = setting.description;
    this.category = setting.category;
    this.updatedBy = setting.updatedBy;
    this.createdAt = setting.createdAt;
    this.updatedAt = setting.updatedAt;
  }
}

