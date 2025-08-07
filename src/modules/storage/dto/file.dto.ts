import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileDto {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;
}
