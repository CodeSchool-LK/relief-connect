/**
 * System Setting Type enum
 * Defines the data types that system settings can have
 * Used to determine how to parse and validate setting values
 */
export enum SystemSettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

/**
 * Array of all valid system setting types
 * Useful for validation
 */
export const SYSTEM_SETTING_TYPES = Object.values(SystemSettingType) as string[];

