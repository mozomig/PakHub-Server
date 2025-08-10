import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core/constants';
import { UserRoleGuard } from './common/guards/user-role.guard';
import { AppRoleGuard } from './common/guards/app-role.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { SessionCleanerService } from './worker/session-cleaner/session-cleaner.service';
import { WorkerModule } from './worker/worker.module';
import { FeaturesModule } from './modules/features.module';
import { InfraModule } from './infra/infra.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          stores: [createKeyv(configService.get('VALKEY_URL'))],
          ttl: 10 * 60 * 1000, // 10 minutes,
          nonBlocking: true,
          namespace: 'pakhub',
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>('VALKEY_URL'),
          prefix: 'pakhub-queue',
        },
      }),
    }),
    InfraModule,
    FeaturesModule,
    WorkerModule,
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
    SessionCleanerService,
  ],
})
export class AppModule {}
