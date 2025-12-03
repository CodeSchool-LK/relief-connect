import { IsInt, IsOptional, IsEnum, IsString, IsDateString, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from '../../common/base_dto';
import { IQueryDto } from '../../../interfaces';
import { AuditAction } from '../../../enums/audit-action.enum';

/**
 * DTO for filtering audit logs
 * Used for query parameters when retrieving audit logs
 */
export class AuditLogFiltersDto extends BaseDto implements IQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'User ID must be an integer' })
  userId?: number;

  @IsOptional()
  @IsEnum(AuditAction, { message: 'Action must be a valid AuditAction' })
  action?: AuditAction;

  @IsOptional()
  @IsString({ message: 'Resource type must be a string' })
  resourceType?: string;

  @IsOptional()
  @IsString({ message: 'Resource ID must be a string' })
  resourceId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(1000, { message: 'Limit must not exceed 1000' })
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;

  @IsOptional()
  @IsString({ message: 'Format must be a string' })
  @IsIn(['json', 'csv'], { message: 'Format must be either "json" or "csv"' })
  format?: 'json' | 'csv';

  constructor(data?: {
    userId?: string | number;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    limit?: string | number;
    offset?: string | number;
  }) {
    super();
    if (data) {
      if (data.userId !== undefined) {
        this.userId = typeof data.userId === 'string' ? parseInt(data.userId, 10) : data.userId;
      }
      if (data.action !== undefined) {
        this.action = data.action as AuditAction;
      }
      if (data.resourceType !== undefined) {
        this.resourceType = data.resourceType;
      }
      if (data.resourceId !== undefined) {
        this.resourceId = data.resourceId;
      }
      if (data.startDate !== undefined) {
        this.startDate = data.startDate;
      }
      if (data.endDate !== undefined) {
        this.endDate = data.endDate;
      }
      if (data.limit !== undefined) {
        this.limit = typeof data.limit === 'string' ? parseInt(data.limit, 10) : data.limit;
      }
      if (data.offset !== undefined) {
        this.offset = typeof data.offset === 'string' ? parseInt(data.offset, 10) : data.offset;
      }
    }
  }

  /**
   * Convert DTO to service layer filter format
   */
  toServiceFilters(): {
    userId?: number;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: number | string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } {
    return {
      userId: this.userId,
      action: this.action,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      startDate: this.startDate ? new Date(this.startDate) : undefined,
      endDate: this.endDate ? new Date(this.endDate) : undefined,
      limit: this.limit,
      offset: this.offset,
    };
  }
}

