import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/user.smodule';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN'),
          audience: configService.getOrThrow<string>('JWT_AUDIENCE'),
          issuer: configService.getOrThrow<string>('JWT_ISSUER'),
          algorithm: configService.getOrThrow<string>(
            'JWT_ALGORITHM',
          ) as import('jsonwebtoken').Algorithm,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenService],
})
export class AuthModule {}
