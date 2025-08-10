import { $Enums } from 'generated/prisma';
import { UserEntity } from '../entity/user.entity';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto implements UserEntity {
  constructor(user: UserEntity) {
    Object.assign(this, user);
  }

  @ApiProperty({
    description: 'The ID of the user',
    example: '123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test@test.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'CREATOR',
    enum: $Enums.UserRole,
  })
  @Expose()
  role: $Enums.UserRole;
}
