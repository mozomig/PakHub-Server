import { Controller, Get, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import type { CurrentUserType } from 'src/common/types/current-user.types';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user',
    type: UserDto,
  })
  @Get('me')
  async me(@CurrentUser() user: CurrentUserType): Promise<UserDto> {
    const userEntity = await this.usersService.findById(user.id);
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    return new UserDto(userEntity);
  }
}
