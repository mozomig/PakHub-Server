import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppMembersService } from './app-members.service';
import { AppMemberDto } from './dto/app-member.dto';
import { AppRoles } from 'src/common/decorators/app-role.decorator';
import { AppRole } from 'generated/prisma';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('apps/:appId/members')
export class AppMembersController {
  constructor(private readonly appMembersService: AppMembersService) {}

  @ApiOperation({ summary: 'Get all members of an app' })
  @ApiResponse({
    status: 200,
    description: 'All members of an app',
    type: [AppMemberDto],
  })
  @AppRoles(AppRole.ADMIN)
  @Get()
  async getMembers(@Param('appId') appId: string): Promise<AppMemberDto[]> {
    const appMembers = await this.appMembersService.findAll(appId);
    return appMembers.map((appMember) => new AppMemberDto(appMember));
  }

  @ApiOperation({ summary: 'Add a member to an app' })
  @ApiResponse({
    status: 200,
    description: 'Member added to an app',
    type: AppMemberDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @AppRoles(AppRole.ADMIN)
  @Post()
  async addMember(
    @Param('appId') appId: string,
    @Body() dto: AddMemberDto,
  ): Promise<AppMemberDto> {
    const { email, role } = dto;
    const appMember = await this.appMembersService.add(appId, email, role);
    return new AppMemberDto(appMember);
  }

  @ApiOperation({ summary: 'Change the role of a member' })
  @ApiResponse({
    status: 200,
    description: 'Role changed',
    type: AppMemberDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @AppRoles(AppRole.ADMIN)
  @Put(':userId')
  async changeRole(
    @Param('appId') appId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<AppMemberDto> {
    const { role } = dto;
    const appMember = await this.appMembersService.changeRole(
      appId,
      userId,
      role,
    );
    return new AppMemberDto(appMember);
  }

  @ApiOperation({ summary: 'Remove a member from an app' })
  @ApiResponse({
    status: 200,
    description: 'Member removed from an app',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @AppRoles(AppRole.ADMIN)
  @Delete(':userId')
  async removeMember(
    @Param('appId') appId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.appMembersService.remove(appId, userId);
  }
}
