import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InsightsService', () => {
  let service: InsightsService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      transaction: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      account: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    prismaService = module.get(PrismaService);
  });

  describe('getCashflow', () => {
    it('should return cashflow data for 12 months period', async () => {
      const userId = 'user-123';
      const query = { period: '12months' as const };

      const mockTransactions = [
        {
          postedAt: new Date('2024-01-15'),
          amount: 1000,
          type: 'credit',
        },
        {
          postedAt: new Date('2024-01-20'),
          amount: -200,
          type: 'debit',
        },
        {
          postedAt: new Date('2024-02-10'),
          amount: 1200,
          type: 'credit',
        },
        {
          postedAt: new Date('2024-02-15'),
          amount: -300,
          type: 'debit',
        },
      ];

      prismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.getCashflow(userId, query);

      expect(result.period).toBe('12months');
      expect(result.summary.totalIncome).toBe(2200);
      expect(result.summary.totalExpenses).toBe(500);
      expect(result.summary.netCashflow).toBe(1700);
      expect(result.monthlyData).toHaveLength(2);
      expect(result.monthlyData[0]).toEqual({
        month: '2024-01',
        income: 1000,
        expenses: 200,
        net: 800,
        transactionCount: 2,
      });
    });

    it('should handle different periods correctly', async () => {
      const userId = 'user-123';
      const query = { period: '3months' as const };

      prismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getCashflow(userId, query);

      expect(result.period).toBe('3months');
      expect(result.summary.totalIncome).toBe(0);
      expect(result.summary.totalExpenses).toBe(0);
      expect(result.summary.netCashflow).toBe(0);
    });
  });

  describe('getSpendingByCategory', () => {
    it('should return spending aggregated by category', async () => {
      const userId = 'user-123';
      const query = { month: '2024-01' };

      const mockCategoryData = [
        {
          category: 'Food & Dining',
          _sum: { amount: -500 },
          _count: { id: 10 },
        },
        {
          category: 'Transportation',
          _sum: { amount: -300 },
          _count: { id: 5 },
        },
        {
          category: 'Entertainment',
          _sum: { amount: -200 },
          _count: { id: 3 },
        },
      ];

      prismaService.transaction.groupBy.mockResolvedValue(mockCategoryData);

      const result = await service.getSpendingByCategory(userId, query);

      expect(result.month).toBe('2024-01');
      expect(result.summary.totalSpending).toBe(1000);
      expect(result.summary.categoryCount).toBe(3);
      expect(result.spendingByCategory).toHaveLength(3);
      expect(result.spendingByCategory[0]).toEqual({
        category: 'Food & Dining',
        amount: 500,
        transactionCount: 10,
        percentage: 50,
      });
    });

    it('should handle empty spending data', async () => {
      const userId = 'user-123';
      const query = { month: '2024-01' };

      prismaService.transaction.groupBy.mockResolvedValue([]);

      const result = await service.getSpendingByCategory(userId, query);

      expect(result.month).toBe('2024-01');
      expect(result.summary.totalSpending).toBe(0);
      expect(result.summary.categoryCount).toBe(0);
      expect(result.spendingByCategory).toHaveLength(0);
    });
  });

  describe('getNetworth', () => {
    it('should return networth calculation', async () => {
      const userId = 'user-123';
      const query = {};

      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Checking Account',
          type: 'depository',
          balance: 5000,
          currency: 'CAD',
          institutionName: 'Bank A',
        },
        {
          id: 'account-2',
          name: 'Savings Account',
          type: 'depository',
          balance: 10000,
          currency: 'CAD',
          institutionName: 'Bank A',
        },
        {
          id: 'account-3',
          name: 'Investment Account',
          type: 'investment',
          balance: 25000,
          currency: 'CAD',
          institutionName: 'Investment Co',
        },
      ];

      prismaService.account.findMany.mockResolvedValue(mockAccounts);

      const result = await service.getNetworth(userId, query);

      expect(result.summary.totalNetworth).toBe(40000);
      expect(result.summary.totalAccounts).toBe(3);
      expect(result.summary.currencyCount).toBe(1);
      expect(result.networthByType).toHaveProperty('depository');
      expect(result.networthByType).toHaveProperty('investment');
      expect(result.networthByType.depository.totalBalance).toBe(15000);
      expect(result.networthByType.investment.totalBalance).toBe(25000);
      expect(result.networthByCurrency.CAD).toBe(40000);
    });

    it('should handle multiple currencies', async () => {
      const userId = 'user-123';
      const query = {};

      const mockAccounts = [
        {
          id: 'account-1',
          name: 'CAD Account',
          type: 'depository',
          balance: 5000,
          currency: 'CAD',
          institutionName: 'Bank A',
        },
        {
          id: 'account-2',
          name: 'USD Account',
          type: 'depository',
          balance: 3000,
          currency: 'USD',
          institutionName: 'Bank B',
        },
      ];

      prismaService.account.findMany.mockResolvedValue(mockAccounts);

      const result = await service.getNetworth(userId, query);

      expect(result.summary.totalNetworth).toBe(8000);
      expect(result.summary.currencyCount).toBe(2);
      expect(result.networthByCurrency.CAD).toBe(5000);
      expect(result.networthByCurrency.USD).toBe(3000);
    });
  });

  describe('getSpendingTrends', () => {
    it('should return spending trends analysis', async () => {
      const userId = 'user-123';
      const months = 6;

      const mockSpendingData = [
        {
          postedAt: new Date('2024-01-15'),
          _sum: { amount: -1000 },
          _count: { id: 20 },
        },
        {
          postedAt: new Date('2024-02-15'),
          _sum: { amount: -1200 },
          _count: { id: 25 },
        },
        {
          postedAt: new Date('2024-03-15'),
          _sum: { amount: -800 },
          _count: { id: 15 },
        },
      ];

      prismaService.transaction.groupBy.mockResolvedValue(mockSpendingData);

      const result = await service.getSpendingTrends(userId, months);

      expect(result.period).toBe('6 months');
      expect(result.monthlyTrends).toHaveLength(3);
      expect(result.trendAnalysis.trend).toBe('decreasing');
      expect(result.trendAnalysis.changePercentage).toBe(-20);
      expect(result.trendAnalysis.averageMonthlySpending).toBe(1000);
    });

    it('should handle insufficient data for trends', async () => {
      const userId = 'user-123';
      const months = 6;

      prismaService.transaction.groupBy.mockResolvedValue([]);

      const result = await service.getSpendingTrends(userId, months);

      expect(result.period).toBe('6 months');
      expect(result.monthlyTrends).toHaveLength(0);
      expect(result.trendAnalysis.trend).toBe('insufficient_data');
      expect(result.trendAnalysis.changePercentage).toBe(0);
    });
  });

  describe('getTopMerchants', () => {
    it('should return top merchants by spending', async () => {
      const userId = 'user-123';
      const month = '2024-01';
      const limit = 5;

      const mockMerchantData = [
        {
          merchant: 'Starbucks',
          _sum: { amount: -500 },
          _count: { id: 20 },
        },
        {
          merchant: 'Amazon',
          _sum: { amount: -300 },
          _count: { id: 5 },
        },
        {
          merchant: 'Uber',
          _sum: { amount: -200 },
          _count: { id: 10 },
        },
      ];

      prismaService.transaction.groupBy.mockResolvedValue(mockMerchantData);

      const result = await service.getTopMerchants(userId, month, limit);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        merchant: 'Starbucks',
        totalSpent: 500,
        transactionCount: 20,
        averageTransactionAmount: 25,
      });
    });

    it('should handle no merchants found', async () => {
      const userId = 'user-123';
      const month = '2024-01';
      const limit = 5;

      prismaService.transaction.groupBy.mockResolvedValue([]);

      const result = await service.getTopMerchants(userId, month, limit);

      expect(result).toHaveLength(0);
    });
  });

  describe('private helper methods', () => {
    it('should calculate start date for different periods', () => {
      const now = new Date();
      
      // Test 3 months
      const startDate3Months = (service as any).getStartDateForPeriod('3months');
      expect(startDate3Months.getMonth()).toBe((now.getMonth() - 3 + 12) % 12);
      
      // Test 12 months
      const startDate12Months = (service as any).getStartDateForPeriod('12months');
      expect(startDate12Months.getMonth()).toBe((now.getMonth() - 12 + 12) % 12);
      
      // Test all period
      const startDateAll = (service as any).getStartDateForPeriod('all');
      expect(startDateAll.getFullYear()).toBe(2020);
    });

    it('should group transactions by month correctly', () => {
      const transactions = [
        {
          postedAt: new Date('2024-01-15'),
          amount: 1000,
          type: 'credit',
        },
        {
          postedAt: new Date('2024-01-20'),
          amount: -200,
          type: 'debit',
        },
        {
          postedAt: new Date('2024-02-10'),
          amount: 500,
          type: 'credit',
        },
      ];

      const result = (service as any).groupTransactionsByMonth(transactions);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        month: '2024-01',
        income: 1000,
        expenses: 200,
        net: 800,
        transactionCount: 2,
      });
      expect(result[1]).toEqual({
        month: '2024-02',
        income: 500,
        expenses: 0,
        net: 500,
        transactionCount: 1,
      });
    });

    it('should calculate trend analysis correctly', () => {
      const monthlyTrends = [
        { month: '2024-01', totalSpent: 1000 },
        { month: '2024-02', totalSpent: 1200 },
        { month: '2024-03', totalSpent: 800 },
      ];

      const result = (service as any).calculateTrendAnalysis(monthlyTrends);

      expect(result.trend).toBe('decreasing');
      expect(result.changePercentage).toBe(-20);
      expect(result.changeAmount).toBe(-200);
      expect(result.averageMonthlySpending).toBe(1000);
    });
  });
});
