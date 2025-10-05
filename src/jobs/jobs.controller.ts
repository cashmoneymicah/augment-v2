import { Controller, Post, Get, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SyncTransactionsJobData } from './processors/sync-transactions.processor';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('sync-transactions')
  @UseGuards(JwtAuthGuard)
  async addSyncTransactionsJob(
    @CurrentUser() user: any,
    @Body() data: { accountId: string },
  ) {
    const jobData: SyncTransactionsJobData = {
      accountId: data.accountId,
      userId: user.id,
    };

    const job = await this.jobsService.addSyncTransactionsJob(jobData);
    
    return {
      jobId: job.id,
      status: 'queued',
      accountId: data.accountId,
      userId: user.id,
    };
  }

  @Post('sync-transactions/bulk')
  @UseGuards(JwtAuthGuard)
  async addBulkSyncTransactionsJobs(
    @CurrentUser() user: any,
    @Body() data: { accountIds: string[] },
  ) {
    const jobs: SyncTransactionsJobData[] = data.accountIds.map(accountId => ({
      accountId,
      userId: user.id,
    }));

    const addedJobs = await this.jobsService.addBulkSyncTransactionsJobs(jobs);
    
    return {
      jobIds: addedJobs.map(job => job.id),
      status: 'queued',
      accountIds: data.accountIds,
      userId: user.id,
      count: addedJobs.length,
    };
  }

  @Get('sync-transactions/:jobId')
  @UseGuards(JwtAuthGuard)
  async getSyncTransactionsJob(
    @CurrentUser() user: any,
    @Param('jobId') jobId: string,
  ) {
    const job = await this.jobsService.getSyncTransactionsJob(jobId);
    
    if (!job) {
      return { error: 'Job not found' };
    }

    // Verify job belongs to user
    if (job.data.userId !== user.id) {
      return { error: 'Unauthorized' };
    }

    return {
      jobId: job.id,
      status: await job.getState(),
      data: job.data,
      progress: job.progress,
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
    };
  }

  @Get('sync-transactions')
  @UseGuards(JwtAuthGuard)
  async getSyncTransactionsJobs(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const jobs = await this.jobsService.getSyncTransactionsJobs(status, limitNum);
    
    // Filter jobs by user
    const userJobs = jobs.filter(job => job.data.userId === user.id);

    return userJobs.map(job => ({
      jobId: job.id,
      status: job.getState(),
      data: job.data,
      progress: job.progress,
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
    }));
  }

  @Delete('sync-transactions/:jobId')
  @UseGuards(JwtAuthGuard)
  async cancelSyncTransactionsJob(
    @CurrentUser() user: any,
    @Param('jobId') jobId: string,
  ) {
    const job = await this.jobsService.getSyncTransactionsJob(jobId);
    
    if (!job) {
      return { error: 'Job not found' };
    }

    // Verify job belongs to user
    if (job.data.userId !== user.id) {
      return { error: 'Unauthorized' };
    }

    const cancelled = await this.jobsService.cancelSyncTransactionsJob(jobId);
    
    return {
      jobId,
      cancelled,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getQueueStats() {
    return this.jobsService.getQueueStats();
  }

  @Post('clear-completed')
  @UseGuards(JwtAuthGuard)
  async clearCompletedJobs() {
    await this.jobsService.clearCompletedJobs();
    return { message: 'Completed jobs cleared' };
  }

  @Post('pause')
  @UseGuards(JwtAuthGuard)
  async pauseQueue() {
    await this.jobsService.pauseQueue();
    return { message: 'Queue paused' };
  }

  @Post('resume')
  @UseGuards(JwtAuthGuard)
  async resumeQueue() {
    await this.jobsService.resumeQueue();
    return { message: 'Queue resumed' };
  }
}
