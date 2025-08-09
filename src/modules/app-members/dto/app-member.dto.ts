import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AppRole } from 'generated/prisma';
import { AppMember } from '../types/app-member.type';

export class AppMemberDto implements Partial<AppMember> {
  constructor(appUser: AppMember) {
    Object.assign(this, appUser);
    this.email = appUser.user.email;
  }

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Email',
    example: 'test@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Role',
    example: AppRole.MEMBER,
    enum: AppRole,
  })
  @Expose()
  role: AppRole;
}
