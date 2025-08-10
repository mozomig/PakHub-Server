import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BuildsService } from './builds.service';
import { GetBuildsDto } from './dto/get-build.dto';
import { BuildDto } from './dto/build.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AppRoles } from 'src/common/decorators/app-role.decorator';
import { AppRole, FileType } from 'generated/prisma';
import { AddBuildDto } from './dto/add-build.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDto } from '../../infra/storage/dto/file.dto';
import { StorageService } from '../../infra/storage/storage.service';
import type { Response } from 'express';

@Controller('apps/:appId/builds')
export class BuildsController {
  constructor(
    private readonly buildsService: BuildsService,
    private readonly storageService: StorageService,
  ) {}

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

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload build' })
  @ApiResponse({
    status: 200,
    type: FileDto,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 300 }),
          new FileTypeValidator({
            fileType: 'application/vnd.android.package-archive`',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<FileDto> {
    const id = await this.storageService.upload(file, FileType.BUILDS);
    return new FileDto(id);
  }

  @ApiOperation({ summary: 'Download build' })
  @ApiResponse({ status: 200, description: 'Redirect to build file' })
  @ApiForbiddenResponse()
  @Get(':fileId')
  @AppRoles(AppRole.ADMIN, AppRole.MEMBER)
  async downloadBuild(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.storageService.getFileUrl(fileId);
    res.redirect(url);
  }
}
