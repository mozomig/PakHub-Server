import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UserInputDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Type(() => String)
  @Transform(({ value }) => (value as string).toLowerCase().trim())
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

  @ApiProperty({
    description: 'Device specification',
    example: 'iPhone 13, iOS 15.0',
  })
  @IsString()
  @IsNotEmpty()
  device: string;
}
