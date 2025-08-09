import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core/constants';
import { AppsModule } from './modules/apps/apps.module';
import { StorageModule } from './modules/storage/storage.module';
import { UserRoleGuard } from './common/guards/user-role.guard';
import { AppRoleGuard } from './common/guards/app-role.guard';
import { StagesModule } from './modules/stages/stages.module';
import { AppMembersModule } from './modules/app-members/app-members.module';
import { BuildsModule } from './modules/builds/builds.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AppsModule,
    StorageModule,
    StagesModule,
    AppMembersModule,
    BuildsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserRoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AppRoleGuard,
    },
  ],
})
export class AppModule {}
