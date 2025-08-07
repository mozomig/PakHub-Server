import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppsService } from './apps.service';
import { GetAppsDto } from './dto/get-apps.dto';
import { AppDto } from './dto/app.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { CurrentUserType } from '../../common/types/current-user.types';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { FileDto } from '../storage/dto/file.dto';
import { FileType } from 'generated/prisma';

@Controller('apps')
@UseGuards(AuthGuard)
export class AppsController {
  constructor(
    private readonly appsService: AppsService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async getApps(
    @Query() query: GetAppsDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<AppDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const apps = await this.appsService.getApps(user.id, page, limit);
    return apps.map((app) => new AppDto(app));
  }

  @Post()
  async create(
    @Body() createAppDto: CreateAppDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<AppDto> {
    const app = await this.appsService.create(user.id, createAppDto);
    return new AppDto(app);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppDto: UpdateAppDto,
  ): Promise<AppDto> {
    const app = await this.appsService.update(id, updateAppDto);
    return new AppDto(app);
  }

  @Post('logo/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileDto> {
    const id = await this.storageService.upload(file, FileType.LOGO);
    return new FileDto(id);
  }

  @Get('logo/:id')
  async getLogo(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const url = await this.storageService.getFileUrl(id);
    res.redirect(url);
  }
}
