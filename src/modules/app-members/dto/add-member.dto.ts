import { AppRole } from 'generated/prisma';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role',
    example: AppRole.MEMBER,
    enum: AppRole,
  })
  @IsEnum(AppRole)
  @IsNotEmpty()
  role: AppRole;
}
