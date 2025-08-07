import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserInputDto } from './dto/user-input.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({
    description: 'User already exists',
  })
  @Public()
  @Post('register')
  async register(@Body() userInputDto: UserInputDto): Promise<AuthResponseDto> {
    const tokens = await this.authService.register(userInputDto);
    return new AuthResponseDto(tokens.accessToken, tokens.refreshToken);
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @Public()
  @Post('login')
  async login(@Body() userInputDto: UserInputDto): Promise<AuthResponseDto> {
    const tokens = await this.authService.login(userInputDto);
    return new AuthResponseDto(tokens.accessToken, tokens.refreshToken);
  }
}
