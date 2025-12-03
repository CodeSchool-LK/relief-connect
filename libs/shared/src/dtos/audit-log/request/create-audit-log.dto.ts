import { IsEnum, IsInt, IsOptional, IsString, IsObject } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { AuditAction } from '../../../enums/audit-action.enum';

/**
 * DTO for creating an audit log entry
 * Used when logging audit actions
 */
export class CreateAuditLogDto extends BaseDto {
  @IsEnum(AuditAction, { message: 'Action must be a valid AuditAction' })
  action!: AuditAction;

  @IsOptional()
  @IsInt({ message: 'User ID must be an integer' })
  userId?: number;

  @IsOptional()
  @IsString({ message: 'Resource type must be a string' })
  resourceType?: string;

  @IsOptional()
  @IsString({ message: 'Resource ID must be a string' })
  resourceId?: string;

  @IsOptional()
  @IsObject({ message: 'Details must be an object' })
  details?: Record<string, unknown>;

  @IsOptional()
  @IsString({ message: 'IP address must be a string' })
  ipAddress?: string;

  @IsOptional()
  @IsString({ message: 'User agent must be a string' })
  userAgent?: string;

  constructor(data?: {
    action: AuditAction;
    userId?: number;
    resourceType?: string;
    resourceId?: number | string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    super();
    if (data) {
      this.action = data.action;
      this.userId = data.userId;
      this.resourceType = data.resourceType;
      this.resourceId = data.resourceId !== undefined ? String(data.resourceId) : undefined;
      this.details = data.details;
      this.ipAddress = data.ipAddress;
      this.userAgent = data.userAgent;
    }
  }
}

