import { SystemSettingType } from '../../enums/system-setting-type.enum';

/**
 * System Setting interface
 * 
 * The type field indicates how the value should be parsed and validated:
 * - STRING: Plain text value
 * - NUMBER: Numeric value (stored as string, parsed to number)
 * - BOOLEAN: Boolean value (stored as string 'true'/'false', parsed to boolean)
 * - JSON: JSON object/array (stored as string, parsed to object)
 */
export interface ISystemSetting {
  id?: number;
  key: string;
  value: string;
  type: SystemSettingType;
  description?: string;
  category?: string;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

