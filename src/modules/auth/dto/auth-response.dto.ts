import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthResponseDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  @ApiProperty({
    description: 'JWT access token',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
  })
  @Expose()
  refreshToken: string;
}
