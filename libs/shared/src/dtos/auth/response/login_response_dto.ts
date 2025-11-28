import { ILoginResponse } from '../../../interfaces/auth/ILoginResponse';
import { UserResponseDto } from '../../user/response/user_response_dto';

/**
 * DTO for login response
 */
export class LoginResponseDto implements ILoginResponse {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;

  constructor(loginResponse: ILoginResponse) {
    this.user = new UserResponseDto(loginResponse.user as any);
    this.accessToken = loginResponse.accessToken;
    this.refreshToken = loginResponse.refreshToken;
  }
}

