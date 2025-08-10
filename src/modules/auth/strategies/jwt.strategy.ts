import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import type { JwtPayload } from '../types/jwt_payload.types';
import { CurrentUserType } from 'src/common/types/current-user.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      audience: configService.getOrThrow<string>('JWT_AUDIENCE'),
      issuer: configService.getOrThrow<string>('JWT_ISSUER'),
      algorithms: [
        configService.getOrThrow<string>(
          'JWT_ALGORITHM',
        ) as import('jsonwebtoken').Algorithm,
      ],
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserType> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
