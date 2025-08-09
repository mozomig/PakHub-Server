import { Injectable, NotFoundException } from '@nestjs/common';
import { AppRole } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppMember } from './types/app-member.type';

@Injectable()
export class AppMembersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async add(appId: string, email: string, role: AppRole): Promise<AppMember> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.appUser.create({
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

    return this.prisma.appUser.update({
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
  }
}
