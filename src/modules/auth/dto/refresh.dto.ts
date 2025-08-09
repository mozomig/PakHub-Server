import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token string',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: 'Device specification',
    example: 'iPhone 13, iOS 15.0',
  })
  @IsString()
  @IsNotEmpty()
  device: string;
}
