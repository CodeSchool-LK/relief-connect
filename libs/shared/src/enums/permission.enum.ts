/**
 * Permission enum for system administrators
 * These permissions control what actions system administrators can perform
 */
export enum Permission {
  // User Management
  MANAGE_USERS = 'MANAGE_USERS', // Create, update, delete users
  VIEW_USERS = 'VIEW_USERS', // View user list and details

  // System Administrator Management
  MANAGE_ADMINS = 'MANAGE_ADMINS', // Create, update, delete system administrators
  ASSIGN_PERMISSIONS = 'ASSIGN_PERMISSIONS', // Assign permissions to system administrators

  // System Settings
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS', // Update system configuration

  // Audit Logs
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS', // View audit logs
  EXPORT_AUDIT_LOGS = 'EXPORT_AUDIT_LOGS', // Export audit logs

  // Volunteer Club Management
  MANAGE_VOLUNTEER_CLUBS = 'MANAGE_VOLUNTEER_CLUBS', // Manage volunteer clubs

  // Content Moderation
  MODERATE_CONTENT = 'MODERATE_CONTENT', // Moderate help requests, donations, camps
}

