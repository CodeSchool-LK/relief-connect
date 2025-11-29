import { IsEnum, IsString, IsOptional, Length } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { MembershipStatus } from '../../../enums';

/**
 * DTO for reviewing (approving/rejecting) a membership request
 */
export class ReviewMembershipDto extends BaseDto implements IBodyDto {
  @IsEnum(MembershipStatus, { message: 'Status must be PENDING, APPROVED, or REJECTED' })
  status!: MembershipStatus;

  @IsString({ message: 'Notes must be a string' })
  @IsOptional()
  @Length(0, 1000, { message: 'Notes must be between 0 and 1000 characters' })
  notes?: string;

  constructor(data?: Partial<ReviewMembershipDto>) {
    super();
    if (data) {
      this.status = data.status!;
      this.notes = data.notes;
    }
  }
}

