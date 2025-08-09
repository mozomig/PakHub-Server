import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Build } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddBuildDto } from './dto/add-build.dto';

@Injectable()
export class BuildsService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchBuilds(
    appId: string,
    stageId: string,
    page: number,
    limit: number,
  ): Promise<Build[]> {
    return await this.prisma.build.findMany({
      where: {
        stageId,
        stage: {
          appId,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async addBuild(appId: string, build: AddBuildDto): Promise<Build> {
    const { stageId, fileId, version, buildNumber, releaseNotes } = build;

    const stage = await this.prisma.stage.findUnique({
      where: {
        id: stageId,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    if (stage.appId !== appId) {
      throw new BadRequestException('Stage does not belong to the app');
    }

    const file = await this.prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return await this.prisma.build.create({
      data: {
        stageId,
        fileId,
        version,
        buildNumber,
        releaseNotes,
      },
    });
  }

  async deleteBuild(appId: string, buildId: string): Promise<void> {
    await this.prisma.build.findUnique({
      where: {
        id: buildId,
        stage: {
          appId,
        },
      },
    });
  }
}
