import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Build, Stage } from 'generated/prisma';
import { BuildDto } from 'src/modules/builds/dto/build.dto';

export class LastBuildDto {
  constructor(stage: Stage, build?: Build) {
    this.stageName = stage.name;
    this.stageId = stage.id;
    this.lastBuild = build ? new BuildDto(build) : undefined;
  }

  @ApiProperty({
    description: 'Stage name',
    example: 'Development',
  })
  @Expose()
  stageName: string;

  @ApiProperty({
    description: 'Stage ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  stageId: string;

  @ApiProperty({
    description: 'Last build',
    type: BuildDto,
    required: false,
  })
  @Expose()
  lastBuild?: BuildDto;
}
