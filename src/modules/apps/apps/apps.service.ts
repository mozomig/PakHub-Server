import { Injectable } from '@nestjs/common';
import { App, AppRole } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAppDto } from './dto/update-app.dto';

@Injectable()
export class AppsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApps(userId: string, page: number, limit: number): Promise<App[]> {
    return this.prisma.app.findMany({
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
    });
  }

  async create(userId: string, name: string): Promise<App> {
    return this.prisma.app.create({
      data: {
        name,
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
