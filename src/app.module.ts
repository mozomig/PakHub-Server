import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core/constants';
import { AppsModule } from './modules/apps/apps.module';
import { StorageModule } from './infra/storage/storage.module';
import { UserRoleGuard } from './common/guards/user-role.guard';
import { AppRoleGuard } from './common/guards/app-role.guard';
import { StagesModule } from './modules/stages/stages.module';
import { AppMembersModule } from './modules/app-members/app-members.module';
import { BuildsModule } from './modules/builds/builds.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          stores: [createKeyv(configService.get('VALKEY_URL'))],
          ttl: 10 * 60 * 1000, // 10 minutes,
          nonBlocking: true,
          namespace: 'pakhub',
        };
      },
      imports: [ConfigModule],
    }),
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
