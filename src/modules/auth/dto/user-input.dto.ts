import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserInputDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password',
    minimum: 8,
    maximum: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  password: string;
}
