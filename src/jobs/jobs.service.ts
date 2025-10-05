import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { SyncTransactionsJobData } from './processors/sync-transactions.processor';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private syncTransactionsQueue!: Queue;

  async onModuleInit() {
    this.initializeQueues();
  }

  async onModuleDestroy() {
    await this.shutdownQueues();
  }

  private initializeQueues() {
    this.syncTransactionsQueue = new Queue('sync-transactions', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.logger.log('Job queues initialized');
  }

  private async shutdownQueues() {
    if (this.syncTransactionsQueue) {
      await this.syncTransactionsQueue.close();
      this.logger.log('Job queues shutdown');
    }
  }

  async addSyncTransactionsJob(data: SyncTransactionsJobData): Promise<Job<SyncTransactionsJobData>> {
    this.logger.log(`Adding sync transactions job for account ${data.accountId}`);
    
    const job = await this.syncTransactionsQueue.add('sync-transactions', data, {
      jobId: `sync-${data.accountId}-${Date.now()}`,
      delay: 0,
    });

    this.logger.log(`Sync transactions job ${job.id} added to queue`);
    return job;
  }

  async addBulkSyncTransactionsJobs(jobs: SyncTransactionsJobData[]): Promise<Job<SyncTransactionsJobData>[]> {
    this.logger.log(`Adding ${jobs.length} bulk sync transactions jobs`);
    
    const queueJobs = jobs.map(data => ({
      name: 'sync-transactions',
      data,
      opts: {
        jobId: `sync-${data.accountId}-${Date.now()}`,
        delay: 0,
      },
    }));

    const addedJobs = await this.syncTransactionsQueue.addBulk(queueJobs);
    
    this.logger.log(`${addedJobs.length} sync transactions jobs added to queue`);
    return addedJobs;
  }

  async getSyncTransactionsJob(jobId: string): Promise<Job<SyncTransactionsJobData> | undefined> {
    return this.syncTransactionsQueue.getJob(jobId);
  }

  async getSyncTransactionsJobs(status?: string, limit: number = 10): Promise<Job<SyncTransactionsJobData>[]> {
    if (status) {
      return this.syncTransactionsQueue.getJobs([status as any], 0, limit - 1);
    }
    return this.syncTransactionsQueue.getJobs(['waiting', 'active', 'completed', 'failed'], 0, limit - 1);
  }

  async cancelSyncTransactionsJob(jobId: string): Promise<boolean> {
    const job = await this.syncTransactionsQueue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Sync transactions job ${jobId} cancelled`);
      return true;
    }
    return false;
  }

  async getQueueStats() {
    const waiting = await this.syncTransactionsQueue.getWaiting();
    const active = await this.syncTransactionsQueue.getActive();
    const completed = await this.syncTransactionsQueue.getCompleted();
    const failed = await this.syncTransactionsQueue.getFailed();

    return {
      syncTransactions: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length,
      },
    };
  }

  async clearCompletedJobs(): Promise<void> {
    await this.syncTransactionsQueue.clean(0, 100, 'completed');
    await this.syncTransactionsQueue.clean(0, 100, 'failed');
    this.logger.log('Completed and failed jobs cleared');
  }

  async pauseQueue(): Promise<void> {
    await this.syncTransactionsQueue.pause();
    this.logger.log('Sync transactions queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.syncTransactionsQueue.resume();
    this.logger.log('Sync transactions queue resumed');
  }
}
