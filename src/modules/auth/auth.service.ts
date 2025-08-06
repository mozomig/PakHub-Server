import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInputDto } from './dto/user-input.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from './types/jwt_payload.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(userInputDto: UserInputDto) {
    const { email } = userInputDto;

    const user = await this.userService.findByEmail(email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const password = await argon2.hash(userInputDto.password);

    const registeredUser = await this.prismaService.user.create({
      data: {
        email,
        password,
      },
    });

    const payload: JwtPayload = {
      sub: registeredUser.id,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(userInputDto: UserInputDto) {
    const { email, password } = userInputDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
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

  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ),
      algorithm: this.configService.getOrThrow('JWT_ALGORITHM'),
      audience: this.configService.getOrThrow('JWT_AUDIENCE'),
      issuer: this.configService.getOrThrow('JWT_ISSUER'),
    });
  }
}
