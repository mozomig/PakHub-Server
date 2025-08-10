import { Injectable } from '@nestjs/common';
import { App, AppRole } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAppDto } from './dto/update-app.dto';
import { CreateAppDto } from './dto/create-app.dto';
import { AppSummary } from './types/app-summary.types';

@Injectable()
export class AppsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApps(
    userId: string,
    page: number,
    limit: number,
  ): Promise<AppSummary[]> {
    const apps = await this.prisma.app.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        stages: {
          include: {
            builds: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    return apps;
  }

  async create(userId: string, input: CreateAppDto): Promise<App> {
    const { name, logoId } = input;
    return this.prisma.app.create({
      data: {
        name,
        logoId,
        users: {
          create: {
            userId: userId,
            role: AppRole.ADMIN,
          },
        },
      },
    });
  }

  async update(appId: string, updateAppDto: UpdateAppDto): Promise<App> {
    const updateData = Object.assign({}, updateAppDto);

    return this.prisma.app.update({
      where: { id: appId },
      data: updateData,
    });
  }
}
