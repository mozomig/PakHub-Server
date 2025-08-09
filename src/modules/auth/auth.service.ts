import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { UserInputDto } from './dto/user-input.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from './types/jwt_payload.types';
import { RefreshTokenService } from './refresh-token.service';
import type { Tokens } from './types/tokens.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(userInputDto: UserInputDto): Promise<Tokens> {
    const { email, device } = userInputDto;

    const user = await this.userService.findByEmail(email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const password = await argon2.hash(userInputDto.password);

    const registeredUser = await this.userService.create(email, password);

    const {
      sid,
      token: refreshToken,
      expiresAt,
    } = await this.refreshTokenService.issue(registeredUser.id, device);

    const payload: JwtPayload = {
      sub: registeredUser.id,
      sid,
    };

    const accessToken = this.generateAccessToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresAtRefreshToken: expiresAt,
    };
  }

  async login(userInputDto: UserInputDto): Promise<Tokens> {
    const { email, password, device } = userInputDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const {
      sid,
      token: refreshToken,
      expiresAt,
    } = await this.refreshTokenService.issue(user.id, device);

    const payload: JwtPayload = {
      sub: user.id,
      sid,
    };

    const accessToken = this.generateAccessToken(payload);
    return {
      accessToken,
      refreshToken,
      expiresAtRefreshToken: expiresAt,
    };
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN'),
      algorithm: this.configService.getOrThrow('JWT_ALGORITHM'),
      audience: this.configService.getOrThrow('JWT_AUDIENCE'),
      issuer: this.configService.getOrThrow('JWT_ISSUER'),
    });
  }

  async refresh(refreshToken: string, device: string): Promise<Tokens> {
    const { userId } = await this.refreshTokenService.verify(refreshToken);

    const {
      sid,
      token: newRefreshToken,
      expiresAt,
    } = await this.refreshTokenService.rotate(refreshToken, userId, device);

    const payload: JwtPayload = { sub: userId, sid };
    const accessToken = this.generateAccessToken(payload);
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAtRefreshToken: expiresAt,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revoke(refreshToken);
  }
}
