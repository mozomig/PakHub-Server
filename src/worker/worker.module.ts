import { Module } from '@nestjs/common';
import { SessionCleanerModule } from './session-cleaner/session-cleaner.module';

@Module({
  imports: [SessionCleanerModule],
  exports: [SessionCleanerModule],
})
export class WorkerModule {}
