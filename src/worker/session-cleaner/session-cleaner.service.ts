import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class SessionCleanerService {
  constructor(private readonly prisma: PrismaService) {}

  async cleanSessions(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const { count } = await this.prisma.session.deleteMany({
      where: {
        OR: [
          {
            revokedAt: { lt: oneDayAgo },
          },
          {
            expiresAt: { lt: oneDayAgo },
          },
        ],
      },
    });
    return count;
  }
}
