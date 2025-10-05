import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { SyncTransactionsProcessor } from './processors/sync-transactions.processor';
import { PlaidModule } from '../plaid/plaid.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PlaidModule],
  controllers: [JobsController],
  providers: [JobsService, SyncTransactionsProcessor, PrismaService],
  exports: [JobsService, SyncTransactionsProcessor],
})
export class JobsModule {}
