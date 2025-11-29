import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for requesting membership to a volunteer club
 */
export class RequestMembershipDto extends BaseDto implements IBodyDto {
  @IsInt({ message: 'Volunteer club ID must be an integer' })
  @IsNotEmpty({ message: 'Volunteer club ID is required' })
  @Min(1, { message: 'Volunteer club ID must be greater than 0' })
  volunteerClubId!: number;

  constructor(data?: Partial<RequestMembershipDto>) {
    super();
    if (data) {
      this.volunteerClubId = data.volunteerClubId!;
    }
  }
}

