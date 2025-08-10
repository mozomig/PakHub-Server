import { Module, OnModuleInit } from '@nestjs/common';
import { SessionCleanerService } from './session-cleaner.service';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { SessionCleanerConsumer } from './session-cleaner.consumer';
import { QUEUE_NAME, JOB_NAME, JOB_ID } from './constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAME,
    }),
  ],
  providers: [SessionCleanerService, SessionCleanerConsumer],
})
export class SessionCleanerModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @InjectQueue(QUEUE_NAME) private readonly sessionCleanerQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.sessionCleanerQueue.add(
      JOB_NAME,
      {},
      {
        repeat: {
          pattern: this.configService.getOrThrow<string>(
            'CLEAN_SESSIONS_PATTERN',
          ),
        },
        jobId: JOB_ID,
      },
    );
  }
}
