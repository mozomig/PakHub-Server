import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  private refreshSecret: string;
  private refreshTtlDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.refreshSecret = this.config.getOrThrow<string>('REFRESH_SECRET');
    this.refreshTtlDays = +this.config.getOrThrow<string>('REFRESH_TTL_DAYS');
  }

  async issue(
    userId: string,
    device: string,
  ): Promise<{
    sid: string;
    token: string;
    expiresAt: Date;
  }> {
    const token = this.generateRawToken();
    const expiresAt = this.computeExpiresAt();
    const tokenHash = this.hashToken(token);

    const session = await this.prisma.session.create({
      data: {
        userId,
        device,
        tokenHash,
        expiresAt,
      },
    });

    return { sid: session.id, token, expiresAt };
  }

  async revoke(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async verify(token: string): Promise<{
    sessionId: string;
    userId: string;
    expiresAt: Date;
  }> {
    const tokenHash = this.hashToken(token);

    const session = await this.prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      sessionId: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    };
  }

  async rotate(
    oldToken: string,
    userId: string,
    device: string,
  ): Promise<{
    sid: string;
    token: string;
    expiresAt: Date;
  }> {
    await this.revoke(oldToken);
    return this.issue(userId, device);
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  private generateRawToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto
      .createHmac('sha256', this.refreshSecret)
      .update(token)
      .digest('hex');
  }

  private computeExpiresAt(): Date {
    const expires = new Date();
    expires.setDate(expires.getDate() + this.refreshTtlDays);
    return expires;
  }
}
