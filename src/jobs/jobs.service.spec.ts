import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { SyncTransactionsProcessor } from './processors/sync-transactions.processor';
import { PlaidService } from '../plaid/plaid.service';

describe('JobsService', () => {
  let service: JobsService;
  let mockQueueInstance: any;

  beforeEach(async () => {
    mockQueueInstance = {
      add: jest.fn(),
      addBulk: jest.fn(),
      getJob: jest.fn(),
      getJobs: jest.fn(),
      getWaiting: jest.fn(),
      getActive: jest.fn(),
      getCompleted: jest.fn(),
      getFailed: jest.fn(),
      clean: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      close: jest.fn(),
    };

    const mockQueue = {
      Queue: jest.fn().mockImplementation(() => mockQueueInstance),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: 'Queue',
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    
    // Mock the queue initialization
    (service as any).syncTransactionsQueue = mockQueueInstance;
  });

  describe('addSyncTransactionsJob', () => {
    it('should add a sync transactions job to the queue', async () => {
      const jobData = {
        accountId: 'account-123',
        userId: 'user-123',
      };

      const mockJob = {
        id: 'job-123',
        data: jobData,
      };

      mockQueueInstance.add.mockResolvedValue(mockJob);

      const result = await service.addSyncTransactionsJob(jobData);

      expect(result).toEqual(mockJob);
      expect(mockQueueInstance.add).toHaveBeenCalledWith('sync-transactions', jobData, {
        jobId: expect.stringMatching(/^sync-account-123-\d+$/),
        delay: 0,
      });
    });
  });

  describe('addBulkSyncTransactionsJobs', () => {
    it('should add multiple sync transactions jobs to the queue', async () => {
      const jobsData = [
        { accountId: 'account-1', userId: 'user-123' },
        { accountId: 'account-2', userId: 'user-123' },
      ];

      const mockJobs = [
        { id: 'job-1', data: jobsData[0] },
        { id: 'job-2', data: jobsData[1] },
      ];

      mockQueueInstance.addBulk.mockResolvedValue(mockJobs);

      const result = await service.addBulkSyncTransactionsJobs(jobsData);

      expect(result).toEqual(mockJobs);
      expect(mockQueueInstance.addBulk).toHaveBeenCalledWith([
        {
          name: 'sync-transactions',
          data: jobsData[0],
          opts: {
            jobId: expect.stringMatching(/^sync-account-1-\d+$/),
            delay: 0,
          },
        },
        {
          name: 'sync-transactions',
          data: jobsData[1],
          opts: {
            jobId: expect.stringMatching(/^sync-account-2-\d+$/),
            delay: 0,
          },
        },
      ]);
    });
  });

  describe('getSyncTransactionsJob', () => {
    it('should get a specific job by ID', async () => {
      const jobId = 'job-123';
      const mockJob = { id: jobId, data: { accountId: 'account-123' } };

      mockQueueInstance.getJob.mockResolvedValue(mockJob);

      const result = await service.getSyncTransactionsJob(jobId);

      expect(result).toEqual(mockJob);
      expect(mockQueueInstance.getJob).toHaveBeenCalledWith(jobId);
    });

    it('should return undefined if job not found', async () => {
      const jobId = 'nonexistent-job';

      mockQueueInstance.getJob.mockResolvedValue(undefined);

      const result = await service.getSyncTransactionsJob(jobId);

      expect(result).toBeUndefined();
    });
  });

  describe('getSyncTransactionsJobs', () => {
    it('should get jobs with specific status', async () => {
      const mockJobs = [
        { id: 'job-1', data: { accountId: 'account-1' } },
        { id: 'job-2', data: { accountId: 'account-2' } },
      ];

      mockQueueInstance.getJobs.mockResolvedValue(mockJobs);

      const result = await service.getSyncTransactionsJobs('completed', 10);

      expect(result).toEqual(mockJobs);
      expect(mockQueueInstance.getJobs).toHaveBeenCalledWith(['completed'], 0, 9);
    });

    it('should get all jobs if no status specified', async () => {
      const mockJobs = [
        { id: 'job-1', data: { accountId: 'account-1' } },
        { id: 'job-2', data: { accountId: 'account-2' } },
      ];

      mockQueueInstance.getJobs.mockResolvedValue(mockJobs);

      const result = await service.getSyncTransactionsJobs(undefined, 10);

      expect(result).toEqual(mockJobs);
      expect(mockQueueInstance.getJobs).toHaveBeenCalledWith(['waiting', 'active', 'completed', 'failed'], 0, 9);
    });
  });

  describe('cancelSyncTransactionsJob', () => {
    it('should cancel a job successfully', async () => {
      const jobId = 'job-123';
      const mockJob = {
        id: jobId,
        data: { accountId: 'account-123' },
        remove: jest.fn().mockResolvedValue(undefined),
      };

      mockQueueInstance.getJob.mockResolvedValue(mockJob);

      const result = await service.cancelSyncTransactionsJob(jobId);

      expect(result).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('should return false if job not found', async () => {
      const jobId = 'nonexistent-job';

      mockQueueInstance.getJob.mockResolvedValue(undefined);

      const result = await service.cancelSyncTransactionsJob(jobId);

      expect(result).toBe(false);
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      mockQueueInstance.getWaiting.mockResolvedValue([{ id: 'job-1' }]);
      mockQueueInstance.getActive.mockResolvedValue([{ id: 'job-2' }]);
      mockQueueInstance.getCompleted.mockResolvedValue([{ id: 'job-3' }, { id: 'job-4' }]);
      mockQueueInstance.getFailed.mockResolvedValue([{ id: 'job-5' }]);

      const result = await service.getQueueStats();

      expect(result).toEqual({
        syncTransactions: {
          waiting: 1,
          active: 1,
          completed: 2,
          failed: 1,
          total: 5,
        },
      });
    });
  });

  describe('clearCompletedJobs', () => {
    it('should clear completed and failed jobs', async () => {
      mockQueueInstance.clean.mockResolvedValue(undefined);

      await service.clearCompletedJobs();

      expect(mockQueueInstance.clean).toHaveBeenCalledWith(0, 100, 'completed');
      expect(mockQueueInstance.clean).toHaveBeenCalledWith(0, 100, 'failed');
    });
  });

  describe('pauseQueue', () => {
    it('should pause the queue', async () => {
      mockQueueInstance.pause.mockResolvedValue(undefined);

      await service.pauseQueue();

      expect(mockQueueInstance.pause).toHaveBeenCalled();
    });
  });

  describe('resumeQueue', () => {
    it('should resume the queue', async () => {
      mockQueueInstance.resume.mockResolvedValue(undefined);

      await service.resumeQueue();

      expect(mockQueueInstance.resume).toHaveBeenCalled();
    });
  });
});

describe('SyncTransactionsProcessor', () => {
  let processor: SyncTransactionsProcessor;
  let plaidService: any;

  beforeEach(async () => {
    const mockPlaidService = {
      syncTransactions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncTransactionsProcessor,
        {
          provide: PlaidService,
          useValue: mockPlaidService,
        },
      ],
    }).compile();

    processor = module.get<SyncTransactionsProcessor>(SyncTransactionsProcessor);
    plaidService = module.get(PlaidService);
  });

  describe('processJob', () => {
    it('should process sync transactions job successfully', async () => {
      const jobData = {
        accountId: 'account-123',
        userId: 'user-123',
        retryCount: 0,
      };

      const mockJob = {
        data: jobData,
        id: 'job-123',
      };

      plaidService.syncTransactions.mockResolvedValue({
        success: true,
        transactions: [{ id: 'txn-1' }, { id: 'txn-2' }, { id: 'txn-3' }, { id: 'txn-4' }, { id: 'txn-5' }],
      });

      const result = await (processor as any).processJob(mockJob);

      expect(result).toEqual({
        success: true,
        accountId: 'account-123',
        userId: 'user-123',
        newTransactions: 5,
        processedAt: expect.any(String),
      });
      expect(plaidService.syncTransactions).toHaveBeenCalledWith('account-123');
    });

    it('should handle job failure with retry', async () => {
      const jobData = {
        accountId: 'account-123',
        userId: 'user-123',
        retryCount: 0,
      };

      const mockJob = {
        data: jobData,
        id: 'job-123',
      };

      const error = new Error('Network timeout');
      plaidService.syncTransactions.mockRejectedValue(error);

      await expect((processor as any).processJob(mockJob)).rejects.toThrow('Network timeout');
    });

    it('should handle job failure without retry for permanent errors', async () => {
      const jobData = {
        accountId: 'account-123',
        userId: 'user-123',
        retryCount: 0,
      };

      const mockJob = {
        data: jobData,
        id: 'job-123',
      };

      const error = new Error('Account not found');
      plaidService.syncTransactions.mockRejectedValue(error);

      const result = await (processor as any).processJob(mockJob);

      expect(result).toEqual({
        success: false,
        accountId: 'account-123',
        userId: 'user-123',
        error: 'Account not found',
        processedAt: expect.any(String),
      });
    });
  });

  describe('shouldRetry', () => {
    it('should retry for network errors', () => {
      const error = new Error('Network timeout');
      const result = (processor as any).shouldRetry(error, 0);
      expect(result).toBe(true);
    });

    it('should not retry for account not found errors', () => {
      const error = new Error('Account not found');
      const result = (processor as any).shouldRetry(error, 0);
      expect(result).toBe(false);
    });

    it('should not retry when max retries exceeded', () => {
      const error = new Error('Network timeout');
      const result = (processor as any).shouldRetry(error, 3);
      expect(result).toBe(false);
    });

    it('should retry for rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const result = (processor as any).shouldRetry(error, 0);
      expect(result).toBe(true);
    });

    it('should retry for temporary errors', () => {
      const error = new Error('Temporary service unavailable');
      const result = (processor as any).shouldRetry(error, 0);
      expect(result).toBe(true);
    });
  });
});