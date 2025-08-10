import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { App } from 'generated/prisma';
import { LastBuildDto } from './last-build.dto';
import { AppSummary } from '../types/app-summary.types';

export class AppDto implements Pick<App, 'id' | 'name' | 'logoId'> {
  constructor(app: Partial<AppSummary>) {
    Object.assign(this, app);
    if (app.stages) {
      this.stages = app.stages.map(
        (stage) => new LastBuildDto(stage, stage.builds?.[0]),
      );
    }
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
    description: 'Stages',
    type: LastBuildDto,
    isArray: true,
    required: false,
  })
  @Expose()
  stages?: LastBuildDto[];
}
