import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AppRole } from 'generated/prisma';

export class UpdateMemberDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Role',
    example: AppRole.MEMBER,
    enum: AppRole,
  })
  @IsEnum(AppRole)
  @IsNotEmpty()
  role: AppRole;
}
