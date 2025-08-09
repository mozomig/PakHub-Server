import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Stage } from 'generated/prisma';

export class StageDto
  implements Pick<Stage, 'id' | 'name' | 'createdAt' | 'updatedAt'>
{
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

  @ApiProperty({
    description: 'Stage created at',
    example: '2021-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Stage updated at',
    example: '2021-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
