import { Body, Controller, HttpCode, Post } from '@nestjs/common';
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
import { RefreshDto } from './dto/refresh.dto';

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
    return new AuthResponseDto(tokens);
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
    return new AuthResponseDto(tokens);
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto): Promise<AuthResponseDto> {
    const tokens = await this.authService.refresh(dto.refreshToken, dto.device);
    return new AuthResponseDto(tokens);
  }

  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }
}
