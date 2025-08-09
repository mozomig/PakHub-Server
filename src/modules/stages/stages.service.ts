import { Injectable } from '@nestjs/common';
import { Stage } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchAll(appId: string): Promise<Stage[]> {
    return this.prisma.stage.findMany({
      where: {
        appId,
      },
    });
  }

  async create(appId: string, name: string): Promise<Stage> {
    return this.prisma.stage.create({
      data: {
        appId,
        name,
      },
    });
  }

  async update(id: string, name: string): Promise<Stage> {
    return this.prisma.stage.update({
      where: { id },
      data: { name },
    });
  }

  async delete(id: string): Promise<Stage> {
    return this.prisma.stage.delete({
      where: { id },
    });
  }
}
