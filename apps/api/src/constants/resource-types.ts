/**
 * Resource type constants for audit logging
 * Used to identify the type of resource being acted upon in audit logs
 */
export const ResourceType = {
  SYSTEM_ADMINISTRATOR: 'system_administrator',
  SYSTEM_SETTING: 'system_setting',
  USER: 'user',
  VOLUNTEER_CLUB: 'volunteer_club',
  HELP_REQUEST: 'help_request',
  DONATION: 'donation',
  CAMP: 'camp',
  MEMBERSHIP: 'membership',
  ITEM: 'item',
} as const;

/**
 * Type for resource type values
 */
export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

