import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserInputDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  password: string;
}
