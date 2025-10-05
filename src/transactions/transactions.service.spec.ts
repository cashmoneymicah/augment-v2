import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CategorizationService } from './categorization/categorization.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: any;
  let categorizationService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      transaction: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      account: {
        findFirst: jest.fn(),
      },
    };

    const mockCategorizationService = {
      categorize: jest.fn(),
      normalizeMerchantName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CategorizationService,
          useValue: mockCategorizationService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get(PrismaService);
    categorizationService = module.get(CategorizationService);
  });

  describe('getTransactions', () => {
    it('should return transactions with pagination', async () => {
      const userId = 'user-123';
      const query = {
        page: 1,
        limit: 10,
      };

      const mockTransactions = [
        {
          id: 'txn-1',
          amount: -25.50,
          merchant: 'Starbucks',
          category: 'Food & Dining',
          postedAt: new Date('2024-01-15'),
          account: {
            id: 'account-1',
            name: 'Checking Account',
            type: 'depository',
            institutionName: 'Test Bank',
          },
        },
      ];

      prismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      prismaService.transaction.count.mockResolvedValue(1);

      const result = await service.getTransactions(userId, query);

      expect(result).toEqual({
        transactions: mockTransactions,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      });
    });

    it('should filter transactions by date range', async () => {
      const userId = 'user-123';
      const query = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        page: 1,
        limit: 10,
      };

      prismaService.transaction.findMany.mockResolvedValue([]);
      prismaService.transaction.count.mockResolvedValue(0);

      await service.getTransactions(userId, query);

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          account: { userId },
          postedAt: {
            gte: new Date('2024-01-01T00:00:00Z'),
            lte: new Date('2024-01-31T23:59:59Z'),
          },
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              institutionName: true,
            },
          },
        },
        orderBy: { postedAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const userId = 'user-123';
      const createDto = {
        accountId: 'account-123',
        postedAt: '2024-01-15T10:00:00Z',
        amount: -25.50,
        type: 'debit' as const,
        merchant: 'Starbucks',
        notes: 'Coffee purchase',
        isManual: true,
      };

      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        name: 'Checking Account',
      };

      const mockTransaction = {
        id: 'txn-123',
        ...createDto,
        postedAt: new Date(createDto.postedAt),
        account: mockAccount,
      };

      prismaService.account.findFirst.mockResolvedValue(mockAccount);
      categorizationService.categorize.mockReturnValue('Food & Dining');
      categorizationService.normalizeMerchantName.mockReturnValue('starbucks');
      prismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(userId, createDto);

      expect(result).toEqual(mockTransaction);
      expect(categorizationService.categorize).toHaveBeenCalledWith('Starbucks');
      expect(categorizationService.normalizeMerchantName).toHaveBeenCalledWith('Starbucks');
    });

    it('should throw NotFoundException if account not found', async () => {
      const userId = 'user-123';
      const createDto = {
        accountId: 'nonexistent-account',
        postedAt: '2024-01-15T10:00:00Z',
        amount: -25.50,
        type: 'debit' as const,
        merchant: 'Starbucks',
        isManual: true,
      };

      prismaService.account.findFirst.mockResolvedValue(null);

      await expect(service.createTransaction(userId, createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const userId = 'user-123';
      const transactionId = 'txn-123';
      const updateDto = {
        category: 'Entertainment',
        notes: 'Updated notes',
      };

      const existingTransaction = {
        id: transactionId,
        accountId: 'account-123',
        account: { userId },
      };

      const updatedTransaction = {
        ...existingTransaction,
        ...updateDto,
        account: {
          id: 'account-123',
          name: 'Checking Account',
          type: 'depository',
          institutionName: 'Test Bank',
        },
      };

      prismaService.transaction.findFirst.mockResolvedValue(existingTransaction);
      prismaService.transaction.update.mockResolvedValue(updatedTransaction);

      const result = await service.updateTransaction(userId, transactionId, updateDto);

      expect(result).toEqual(updatedTransaction);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      const userId = 'user-123';
      const transactionId = 'nonexistent-txn';
      const updateDto = { category: 'Entertainment' };

      prismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.updateTransaction(userId, transactionId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      const userId = 'user-123';
      const transactionId = 'txn-123';

      const existingTransaction = {
        id: transactionId,
        accountId: 'account-123',
        account: { userId },
      };

      prismaService.transaction.findFirst.mockResolvedValue(existingTransaction);
      prismaService.transaction.delete.mockResolvedValue({});

      const result = await service.deleteTransaction(userId, transactionId);

      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      const userId = 'user-123';
      const transactionId = 'nonexistent-txn';

      prismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.deleteTransaction(userId, transactionId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransactionStats', () => {
    it('should return transaction statistics', async () => {
      const userId = 'user-123';

      prismaService.transaction.count.mockResolvedValue(10);
      prismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: -500 } }) // debits
        .mockResolvedValueOnce({ _sum: { amount: 1000 } }); // credits
      prismaService.transaction.groupBy.mockResolvedValue([
        { category: 'Food & Dining', _sum: { amount: -200 }, _count: { id: 5 } },
        { category: 'Transportation', _sum: { amount: -100 }, _count: { id: 3 } },
      ]);

      const result = await service.getTransactionStats(userId);

      expect(result).toEqual({
        totalTransactions: 10,
        totalDebits: -500,
        totalCredits: 1000,
        netAmount: 1500,
        categoryStats: [
          { category: 'Food & Dining', totalAmount: -200, transactionCount: 5 },
          { category: 'Transportation', totalAmount: -100, transactionCount: 3 },
        ],
      });
    });
  });
});

describe('CategorizationService', () => {
  let service: CategorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategorizationService],
    }).compile();

    service = module.get<CategorizationService>(CategorizationService);
  });

  describe('categorize', () => {
    it('should categorize known merchants correctly', () => {
      expect(service.categorize('UBER')).toBe('Transportation');
      expect(service.categorize('SHOPPERS')).toBe('Groceries');
      expect(service.categorize('NETFLIX')).toBe('Entertainment');
      expect(service.categorize('AMAZON')).toBe('Shopping');
      expect(service.categorize('STARBUCKS')).toBe('Food & Dining');
    });

    it('should handle partial matches', () => {
      expect(service.categorize('UBER EATS')).toBe('Transportation');
      expect(service.categorize('SHOPPERS DRUG MART')).toBe('Groceries');
      expect(service.categorize('NETFLIX SUBSCRIPTION')).toBe('Entertainment');
    });

    it('should return Uncategorized for unknown merchants', () => {
      expect(service.categorize('UNKNOWN MERCHANT')).toBe('Uncategorized');
      expect(service.categorize('')).toBe('Uncategorized');
      expect(service.categorize(null as any)).toBe('Uncategorized');
    });

    it('should handle case insensitive matching', () => {
      expect(service.categorize('uber')).toBe('Transportation');
      expect(service.categorize('Shoppers')).toBe('Groceries');
      expect(service.categorize('netflix')).toBe('Entertainment');
    });
  });

  describe('normalizeMerchantName', () => {
    it('should normalize merchant names correctly', () => {
      expect(service.normalizeMerchantName('DEBIT STARBUCKS')).toBe('starbucks');
      expect(service.normalizeMerchantName('PAYMENT TRANSFER')).toBe('transfer');
      expect(service.normalizeMerchantName('CREDIT REFUND')).toBe('refund');
      expect(service.normalizeMerchantName('AMAZON.COM PURCHASE')).toBe('amazon.com purchase');
    });

    it('should handle empty or null input', () => {
      expect(service.normalizeMerchantName('')).toBe('');
      expect(service.normalizeMerchantName(null as any)).toBe('');
    });
  });

  describe('custom rules', () => {
    it('should allow adding custom rules', () => {
      service.addCustomRule('CUSTOM MERCHANT', 'Custom Category');
      expect(service.categorize('CUSTOM MERCHANT')).toBe('Custom Category');
    });

    it('should allow removing custom rules', () => {
      service.addCustomRule('TEMP MERCHANT', 'Temp Category');
      expect(service.categorize('TEMP MERCHANT')).toBe('Temp Category');
      
      service.removeCustomRule('TEMP MERCHANT');
      expect(service.categorize('TEMP MERCHANT')).toBe('Uncategorized');
    });
  });
});
