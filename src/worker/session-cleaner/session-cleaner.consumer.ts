import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAME } from './constants';
import { Job } from 'bullmq';
import { SessionCleanerService } from './session-cleaner.service';
import { Logger } from '@nestjs/common';

@Processor(QUEUE_NAME)
export class SessionCleanerConsumer extends WorkerHost {
  private readonly logger = new Logger(SessionCleanerConsumer.name);

  constructor(private readonly sessionCleanerService: SessionCleanerService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Session cleaner job started ${job.id}`);
    try {
      const count = await this.sessionCleanerService.cleanSessions();
      this.logger.log(
        `Session cleaner job finished. Deleted ${count} sessions`,
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
