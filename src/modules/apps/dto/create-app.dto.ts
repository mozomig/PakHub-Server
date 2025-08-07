import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAppDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  logoId?: string;
}
