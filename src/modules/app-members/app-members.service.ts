import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AppRole } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppMember } from './types/app-member.type';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

const APP_MEMBER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const APP_MEMBER_CACHE_KEY = (appId: string, userId: string) =>
  `app-member:${appId}:${userId}`;

@Injectable()
export class AppMembersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(appId: string): Promise<AppMember[]> {
    return this.prisma.appUser.findMany({
      where: {
        appId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async getRole(appId: string, userId: string): Promise<AppRole | null> {
    const cachedRole = await this.cacheManager.get<AppRole>(
      APP_MEMBER_CACHE_KEY(appId, userId),
    );
    if (cachedRole) {
      return cachedRole;
    }

    const appUser = await this.prisma.appUser.findUnique({
      where: {
        appId_userId: {
          appId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!appUser) {
      return null;
    }

    await this.cacheManager.set(
      APP_MEMBER_CACHE_KEY(appId, userId),
      appUser.role,
      APP_MEMBER_CACHE_TTL,
    );

    return appUser.role;
  }

  async add(appId: string, email: string, role: AppRole): Promise<AppMember> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const appMember = await this.prisma.appUser.create({
      data: {
        app: {
          connect: {
            id: appId,
          },
        },
        user: {
          connect: {
            email,
          },
        },
        role,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    await this.cacheManager.set(
      APP_MEMBER_CACHE_KEY(appId, user.id),
      appMember.role,
      APP_MEMBER_CACHE_TTL,
    );

    return appMember;
  }

  async changeRole(
    appId: string,
    userId: string,
    role: AppRole,
  ): Promise<AppMember> {
    const appUser = await this.prisma.appUser.findUnique({
      where: {
        appId_userId: {
          appId,
          userId,
        },
      },
    });

    if (!appUser) {
      throw new NotFoundException('App user not found');
    }

    const appMember = await this.prisma.appUser.update({
      where: {
        appId_userId: {
          appId,
          userId,
        },
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    await this.cacheManager.set(
      APP_MEMBER_CACHE_KEY(appId, userId),
      appMember.role,
      APP_MEMBER_CACHE_TTL,
    );

    return appMember;
  }

  async remove(appId: string, userId: string): Promise<void> {
    const appUser = await this.prisma.appUser.findUnique({
      where: {
        appId_userId: {
          appId,
          userId,
        },
      },
    });

    if (!appUser) {
      throw new NotFoundException('App user not found');
    }

    await this.prisma.appUser.delete({
      where: {
        appId_userId: {
          appId,
          userId,
        },
      },
    });

    await this.cacheManager.del(APP_MEMBER_CACHE_KEY(appId, userId));
  }
}
