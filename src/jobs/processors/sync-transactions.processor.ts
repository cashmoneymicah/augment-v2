import { Processor, Worker, Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PlaidService } from '../../plaid/plaid.service';

export interface SyncTransactionsJobData {
  accountId: string;
  userId: string;
  retryCount?: number;
}

@Injectable()
export class SyncTransactionsProcessor {
  private readonly logger = new Logger(SyncTransactionsProcessor.name);
  private worker!: Worker;

  constructor(private plaidService: PlaidService) {}

  async initialize() {
    this.worker = new Worker(
      'sync-transactions',
      this.processJob.bind(this),
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        concurrency: 5,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    );

    this.worker.on('completed', (job: Job) => {
      this.logger.log(`Sync transactions job ${job.id} completed for account ${job.data.accountId}`);
    });

    this.worker.on('failed', (job: Job | undefined, err: Error) => {
      this.logger.error(`Sync transactions job ${job?.id} failed for account ${job?.data.accountId}:`, err);
    });

    this.worker.on('error', (err: Error) => {
      this.logger.error('Sync transactions worker error:', err);
    });

    this.logger.log('Sync transactions processor initialized');
  }

  private async processJob(job: Job<SyncTransactionsJobData>): Promise<any> {
    const { accountId, userId, retryCount = 0 } = job.data;
    
    this.logger.log(`Processing sync transactions job for account ${accountId}, user ${userId}, attempt ${retryCount + 1}`);

    try {
      // Call the Plaid service to sync transactions
      const result = await this.plaidService.syncTransactions(accountId);
      
      this.logger.log(`Successfully synced ${result.transactions.length} new transactions for account ${accountId}`);
      
      return {
        success: true,
        accountId,
        userId,
        newTransactions: result.transactions.length,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to sync transactions for account ${accountId}:`, error);
      
      // Determine if we should retry
      const shouldRetry = this.shouldRetry(error, retryCount);
      
      if (shouldRetry) {
        this.logger.log(`Retrying sync transactions for account ${accountId}, attempt ${retryCount + 1}`);
        throw error; // This will trigger BullMQ retry
      } else {
        this.logger.error(`Max retries exceeded for account ${accountId}, marking as failed`);
        return {
          success: false,
          accountId,
          userId,
          error: error instanceof Error ? error.message : String(error),
          processedAt: new Date().toISOString(),
        };
      }
    }
  }

  private shouldRetry(error: any, retryCount: number): boolean {
    const maxRetries = 3;
    
    // Don't retry if we've exceeded max retries
    if (retryCount >= maxRetries) {
      return false;
    }

    // Don't retry for certain types of errors
    if (error.message?.includes('Account not found') || 
        error.message?.includes('Invalid public token') ||
        error.message?.includes('Invalid access token')) {
      return false;
    }

    // Retry for network errors, rate limits, and temporary failures
    if (error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('rate limit') ||
        error.message?.includes('temporary')) {
      return true;
    }

    // Default to retry for unknown errors
    return true;
  }

  async shutdown() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Sync transactions processor shutdown');
    }
  }
}
