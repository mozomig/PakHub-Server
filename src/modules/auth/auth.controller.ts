import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserInputDto } from './dto/user-input.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() userInputDto: UserInputDto): Promise<AuthResponseDto> {
    return this.authService.register(userInputDto);
  }

  @Public()
  @Post('login')
  async login(@Body() userInputDto: UserInputDto): Promise<AuthResponseDto> {
    return this.authService.login(userInputDto);
  }
}
