import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddBuildDto {
  @ApiProperty({
    description: 'Stage ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  stageId: string;

  @ApiProperty({
    description: 'Build file ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  fileId: string;

  @ApiProperty({
    description: 'Build version',
    example: '1.0.0',
  })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty({
    description: 'Build buildNumber',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  buildNumber?: number;

  @ApiProperty({
    description: 'Build release notes',
    example: 'The best feature is that you can now see the release notes',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  releaseNotes?: string;
}
