import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { StagesService } from './stages.service';
import { AppRoles } from 'src/common/decorators/app-role.decorator';
import { AppRole } from 'generated/prisma';
import { InputStageDto } from './dto/input-stage.dto';
import { StageDto } from './dto/stage.dto';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('apps/:appId/stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @ApiOperation({ summary: 'Get all stages of an app' })
  @ApiResponse({
    status: 200,
    description: 'All stages of an app',
    type: [StageDto],
  })
  @Get()
  @AppRoles(AppRole.ADMIN, AppRole.MEMBER)
  async getStages(@Param('appId') appId: string): Promise<StageDto[]> {
    const stages = await this.stagesService.fetchAll(appId);
    return stages.map((stage) => new StageDto(stage));
  }

  @ApiOperation({ summary: 'Create a stage' })
  @ApiResponse({
    status: 200,
    description: 'Stage created',
    type: StageDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @Post()
  @AppRoles(AppRole.ADMIN)
  async createStage(
    @Param('appId') appId: string,
    @Body() dto: InputStageDto,
  ): Promise<StageDto> {
    const stage = await this.stagesService.create(appId, dto.name);
    return new StageDto(stage);
  }

  @ApiOperation({ summary: 'Update a stage' })
  @ApiResponse({
    status: 200,
    description: 'Stage updated',
    type: StageDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @Put(':id')
  @AppRoles(AppRole.ADMIN)
  async updateStage(
    @Param('appId') appId: string,
    @Param('id') id: string,
    @Body() dto: InputStageDto,
  ): Promise<StageDto> {
    const stage = await this.stagesService.update(id, dto.name);
    return new StageDto(stage);
  }

  @ApiOperation({ summary: 'Delete a stage' })
  @ApiResponse({
    status: 200,
    description: 'Stage deleted',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @Delete(':id')
  @AppRoles(AppRole.ADMIN)
  async deleteStage(@Param('id') id: string) {
    await this.stagesService.delete(id);
  }
}
