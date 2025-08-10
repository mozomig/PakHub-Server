import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Build } from 'generated/prisma';

export class BuildDto
  implements
    Pick<Build, 'id' | 'version' | 'buildNumber' | 'releaseNotes' | 'fileId'>
{
  constructor(build: Partial<Build>) {
    Object.assign(this, build);
  }

  @ApiProperty({
    description: 'Build ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Build version',
    example: '1.0.0',
  })
  @Expose()
  version: string;

  @ApiProperty({
    description: 'Build number',
    example: 1,
    required: false,
  })
  @Expose()
  buildNumber: number | null;

  @ApiProperty({
    description: 'Build release notes',
    example: 'The best feature is that you can now see the release notes',
    required: false,
  })
  @Expose()
  releaseNotes: string | null;

  @ApiProperty({
    description: 'Build file ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  fileId: string;
}
