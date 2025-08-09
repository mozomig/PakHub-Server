import { Module } from '@nestjs/common';
import { AppMembersService } from './app-members.service';
import { AppMembersController } from './app-members.controller';

@Module({
  controllers: [AppMembersController],
  providers: [AppMembersService],
  exports: [AppMembersService],
})
export class AppMembersModule {}
