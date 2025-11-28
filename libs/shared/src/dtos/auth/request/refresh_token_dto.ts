import { IsString, IsNotEmpty } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { IRefreshTokenRequest } from '../../../interfaces/auth/IRefreshTokenRequest';

/**
 * DTO for refresh token request
 * Backend DTO with validation decorators
 * Frontend should use IRefreshTokenRequest interface instead
 */
export class RefreshTokenDto extends BaseDto implements IBodyDto, IRefreshTokenRequest {
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;

  constructor(data?: Partial<IRefreshTokenRequest>) {
    super();
    if (data) {
      this.refreshToken = data.refreshToken || '';
    }
  }
}


