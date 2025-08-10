import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.smodule';
import { AppsModule } from './apps/apps.module';
import { AppMembersModule } from './app-members/app-members.module';
import { StagesModule } from './stages/stages.module';
import { BuildsModule } from './builds/builds.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AppsModule,
    StagesModule,
    AppMembersModule,
    BuildsModule,
  ],
  exports: [
    AuthModule,
    UsersModule,
    AppsModule,
    StagesModule,
    AppMembersModule,
    BuildsModule,
  ],
})
export class FeaturesModule {}
