import { IsNumber, IsNotEmpty, IsObject, IsString, Min, Length } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ICreateCampDonation } from '../../../interfaces/donation/ICreateCampDonation';

/**
 * DTO for creating a new camp donation
 * Backend DTO with validation decorators
 * Frontend should use ICreateCampDonation interface instead
 */
export class CreateCampDonationDto extends BaseDto implements IBodyDto, ICreateCampDonation {
  @IsNumber({}, { message: 'Camp ID must be a number' })
  @IsNotEmpty({ message: 'Camp ID is required' })
  @Min(1, { message: 'Camp ID must be greater than 0' })
  campId!: number;

  @IsString({ message: 'Donator name must be a string' })
  @IsNotEmpty({ message: 'Donator name is required' })
  @Length(1, 100, { message: 'Donator name must be between 1 and 100 characters' })
  donatorName!: string;

  @IsString({ message: 'Donator mobile number must be a string' })
  @IsNotEmpty({ message: 'Donator mobile number is required' })
  @Length(1, 20, { message: 'Donator mobile number must be between 1 and 20 characters' })
  donatorMobileNumber!: string;

  @IsObject({ message: 'Ration items must be an object' })
  @IsNotEmpty({ message: 'Ration items are required' })
  rationItems!: Record<string, number>;

  constructor(data?: Partial<ICreateCampDonation>) {
    super();
    if (data) {
      this.campId = data.campId || 0;
      this.donatorName = data.donatorName || '';
      this.donatorMobileNumber = data.donatorMobileNumber || '';
      this.rationItems = data.rationItems || {};
    }
  }
}

