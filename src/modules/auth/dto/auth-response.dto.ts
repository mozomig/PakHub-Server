import { Expose } from 'class-transformer';

export class AuthResponseDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
