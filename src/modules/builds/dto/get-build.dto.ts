import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetBuildsDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Limit number of builds per page',
    example: 10,
    maximum: 30,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(30)
  limit?: number = 10;

  @ApiProperty({
    description: 'Stage ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  stageId: string;
}
