import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from './base_dto';
import { IQueryDto } from '../../interfaces';

/**
 * DTO for pagination query parameters
 * Used to validate and transform pagination parameters from query strings
 * 
 * Usage:
 * - page: Page number (default: 1, min: 1)
 * - limit: Items per page (default: 10, min: 1, max: 100)
 */
export class PaginationDto extends BaseDto implements IQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;

  constructor(data?: { page?: string | number; limit?: string | number }) {
    super();
    if (data) {
      // Transform string values to numbers if provided
      if (data.page !== undefined) {
        this.page = typeof data.page === 'string' ? parseInt(data.page, 10) : data.page;
      }
      if (data.limit !== undefined) {
        this.limit = typeof data.limit === 'string' ? parseInt(data.limit, 10) : data.limit;
      }
    }
  }

  /**
   * Get validated page number with default
   */
  getPage(): number {
    return this.page && this.page > 0 ? this.page : 1;
  }

  /**
   * Get validated limit with default
   */
  getLimit(): number {
    if (this.limit && this.limit > 0 && this.limit <= 100) {
      return this.limit;
    }
    return 10;
  }
}

