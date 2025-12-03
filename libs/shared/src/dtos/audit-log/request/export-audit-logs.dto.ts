import { IsInt, IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from '../../common/base_dto';
import { IQueryDto } from '../../../interfaces';
import { AuditAction } from '../../../enums/audit-action.enum';

/**
 * DTO for exporting audit logs
 * Requires a time period (startDate and endDate) for export operations
 */
export class ExportAuditLogsDto extends BaseDto implements IQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'User ID must be an integer' })
  userId?: number;

  @IsOptional()
  @IsString({ message: 'Action must be a string' })
  action?: AuditAction;

  @IsOptional()
  @IsString({ message: 'Resource type must be a string' })
  resourceType?: string;

  @IsOptional()
  @IsString({ message: 'Resource ID must be a string' })
  resourceId?: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate!: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate!: string;

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
    format?: string;
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
      if (data.format !== undefined) {
        this.format = data.format as 'json' | 'csv';
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
    startDate: Date;
    endDate: Date;
    limit?: number;
  } {
    return {
      userId: this.userId,
      action: this.action,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      limit: 10000, // Export limit
    };
  }

  /**
   * Custom validation after instantiation
   * This is called by the controller to ensure date range is valid
   */
  validateDateRange(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      
      if (end < start) {
        throw new Error('End date must be after start date');
      }

      // Validate that the time period is not too large (max 1 year)
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        throw new Error('Time period cannot exceed 365 days');
      }
    }
  }
}

