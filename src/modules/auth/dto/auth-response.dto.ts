import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Tokens } from '../types/tokens.types';

export class AuthResponseDto {
  constructor(tokens: Tokens) {
    Object.assign(this, tokens);
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

  @ApiProperty({
    description: 'Refresh token expiration date',
  })
  @Expose()
  expiresAtRefreshToken: Date;
}
