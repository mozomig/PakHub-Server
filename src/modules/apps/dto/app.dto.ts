import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { App } from 'generated/prisma';

export class AppDto implements App {
  constructor(app: Partial<App>) {
    Object.assign(this, app);
  }

  @ApiProperty({
    description: 'App ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'App name',
    example: 'The best mobile app',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'App logo ID (File ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @Expose()
  logoId: string | null;

  @ApiProperty({
    description: 'App created at',
    example: '2021-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'App updated at',
    example: '2021-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
