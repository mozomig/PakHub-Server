import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from 'src/modules/auth/refresh-token.service';

@Injectable()
export class SessionCleanerService {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  async cleanSessions(): Promise<number> {
    return this.refreshTokenService.cleanExpired();
  }
}
