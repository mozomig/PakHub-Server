import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Stage } from 'generated/prisma';

export class StageDto implements Pick<Stage, 'id' | 'name'> {
  constructor(stage: Partial<Stage>) {
    Object.assign(this, stage);
  }

  @ApiProperty({
    description: 'Stage ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Stage name',
    example: 'Development',
  })
  @Expose()
  name: string;
}
