import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BuildsService } from './builds.service';
import { GetBuildsDto } from './dto/get-build.dto';
import { BuildDto } from './dto/build.dto';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AppRoles } from 'src/common/decorators/app-role.decorator';
import { AppRole } from 'generated/prisma';
import { AddBuildDto } from './dto/add-build.dto';

@Controller('apps/:appId/builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  @ApiOperation({ summary: 'Get builds' })
  @ApiResponse({ status: 200, type: [BuildDto] })
  @ApiForbiddenResponse()
  @Get()
  @AppRoles(AppRole.ADMIN, AppRole.MEMBER)
  async getBuilds(
    @Param('appId') appId: string,
    @Query() query: GetBuildsDto,
  ): Promise<BuildDto[]> {
    const { stageId, page = 1, limit = 10 } = query;
    const builds = await this.buildsService.fetchBuilds(
      appId,
      stageId,
      page,
      limit,
    );
    return builds.map((build) => new BuildDto(build));
  }

  @ApiOperation({ summary: 'Add build' })
  @ApiResponse({ status: 201, type: BuildDto })
  @ApiForbiddenResponse()
  @Post()
  @AppRoles(AppRole.ADMIN)
  async addBuild(
    @Param('appId') appId: string,
    @Body() build: AddBuildDto,
  ): Promise<BuildDto> {
    const addedBuild = await this.buildsService.addBuild(appId, build);
    return new BuildDto(addedBuild);
  }

  @ApiOperation({ summary: 'Delete build' })
  @ApiResponse({ status: 200, type: BuildDto })
  @ApiForbiddenResponse()
  @Delete(':buildId')
  @AppRoles(AppRole.ADMIN)
  async deleteBuild(
    @Param('appId') appId: string,
    @Param('buildId') buildId: string,
  ): Promise<void> {
    await this.buildsService.deleteBuild(appId, buildId);
  }
}
