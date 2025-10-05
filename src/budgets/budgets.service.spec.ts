import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      budget: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      transaction: {
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    prismaService = module.get(PrismaService);
  });

  describe('getBudgets', () => {
    it('should return budgets with pagination', async () => {
      const userId = 'user-123';
      const query = {
        page: 1,
        limit: 10,
      };

      const mockBudgets = [
        {
          id: 'budget-1',
          userId: 'user-123',
          month: '2024-01',
          category: 'Food & Dining',
          limitAmount: 500,
          spentAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.budget.findMany.mockResolvedValue(mockBudgets);
      prismaService.budget.count.mockResolvedValue(1);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: -250 } });

      const result = await service.getBudgets(userId, query);

      expect(result).toEqual({
        budgets: [
          {
            ...mockBudgets[0],
            spentAmount: 250,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      });
    });

    it('should filter budgets by month and category', async () => {
      const userId = 'user-123';
      const query = {
        month: '2024-01',
        category: 'Food & Dining',
        page: 1,
        limit: 10,
      };

      prismaService.budget.findMany.mockResolvedValue([]);
      prismaService.budget.count.mockResolvedValue(0);

      await service.getBudgets(userId, query);

      expect(prismaService.budget.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          month: '2024-01',
          category: 'Food & Dining',
        },
        orderBy: [
          { month: 'desc' },
          { category: 'asc' },
        ],
        skip: 0,
        take: 10,
      });
    });
  });

  describe('createBudget', () => {
    it('should create a budget successfully', async () => {
      const userId = 'user-123';
      const createDto = {
        month: '2024-01',
        category: 'Food & Dining',
        limitAmount: 500,
      };

      const mockBudget = {
        id: 'budget-123',
        userId: 'user-123',
        month: '2024-01',
        category: 'Food & Dining',
        limitAmount: 500,
        spentAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.budget.findUnique.mockResolvedValue(null);
      prismaService.budget.create.mockResolvedValue(mockBudget);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: -250 } });

      const result = await service.createBudget(userId, createDto);

      expect(result).toEqual({
        ...mockBudget,
        spentAmount: 250,
      });
    });

    it('should throw ConflictException if budget already exists', async () => {
      const userId = 'user-123';
      const createDto = {
        month: '2024-01',
        category: 'Food & Dining',
        limitAmount: 500,
      };

      const existingBudget = {
        id: 'budget-123',
        userId: 'user-123',
        month: '2024-01',
        category: 'Food & Dining',
        limitAmount: 500,
        spentAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.budget.findUnique.mockResolvedValue(existingBudget);

      await expect(service.createBudget(userId, createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-123';
      const updateDto = {
        limitAmount: 750,
      };

      const existingBudget = {
        id: budgetId,
        userId: 'user-123',
        month: '2024-01',
        category: 'Food & Dining',
        limitAmount: 500,
        spentAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBudget = {
        ...existingBudget,
        limitAmount: 750,
      };

      prismaService.budget.findFirst.mockResolvedValue(existingBudget);
      prismaService.budget.update.mockResolvedValue(updatedBudget);
      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: -300 } });

      const result = await service.updateBudget(userId, budgetId, updateDto);

      expect(result).toEqual({
        ...updatedBudget,
        spentAmount: 300,
      });
    });

    it('should throw NotFoundException if budget not found', async () => {
      const userId = 'user-123';
      const budgetId = 'nonexistent-budget';
      const updateDto = { limitAmount: 750 };

      prismaService.budget.findFirst.mockResolvedValue(null);

      await expect(service.updateBudget(userId, budgetId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBudget', () => {
    it('should delete budget successfully', async () => {
      const userId = 'user-123';
      const budgetId = 'budget-123';

      const existingBudget = {
        id: budgetId,
        userId: 'user-123',
        month: '2024-01',
        category: 'Food & Dining',
        limitAmount: 500,
        spentAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.budget.findFirst.mockResolvedValue(existingBudget);
      prismaService.budget.delete.mockResolvedValue({});

      const result = await service.deleteBudget(userId, budgetId);

      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if budget not found', async () => {
      const userId = 'user-123';
      const budgetId = 'nonexistent-budget';

      prismaService.budget.findFirst.mockResolvedValue(null);

      await expect(service.deleteBudget(userId, budgetId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('computeSpent', () => {
    it('should compute spent amount correctly', async () => {
      const userId = 'user-123';
      const month = '2024-01';
      const category = 'Food & Dining';

      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: -250 } });

      const result = await service.computeSpent(userId, month, category);

      expect(result).toBe(250);
      expect(prismaService.transaction.aggregate).toHaveBeenCalledWith({
        where: {
          account: { userId },
          postedAt: {
            gte: new Date(2024, 0, 1),
            lte: new Date(2024, 0, 31, 23, 59, 59, 999),
          },
          category: 'Food & Dining',
          type: 'debit',
        },
        _sum: { amount: true },
      });
    });

    it('should return 0 if no transactions found', async () => {
      const userId = 'user-123';
      const month = '2024-01';
      const category = 'Food & Dining';

      prismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: null } });

      const result = await service.computeSpent(userId, month, category);

      expect(result).toBe(0);
    });
  });

  describe('getBudgetStats', () => {
    it('should return budget statistics', async () => {
      const userId = 'user-123';
      const month = '2024-01';

      const mockBudgets = [
        {
          id: 'budget-1',
          userId: 'user-123',
          month: '2024-01',
          category: 'Food & Dining',
          limitAmount: 500,
          spentAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'budget-2',
          userId: 'user-123',
          month: '2024-01',
          category: 'Transportation',
          limitAmount: 300,
          spentAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.budget.findMany.mockResolvedValue(mockBudgets);
      prismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: -400 } }) // Food & Dining
        .mockResolvedValueOnce({ _sum: { amount: -350 } }); // Transportation

      const result = await service.getBudgetStats(userId, month);

      expect(result.summary.totalBudgets).toBe(2);
      expect(result.summary.totalLimitAmount).toBe(800);
      expect(result.summary.totalSpentAmount).toBe(750);
      expect(result.summary.totalRemainingAmount).toBe(50);
      expect(result.summary.overBudgetCount).toBe(1);
      expect(result.summary.averagePercentageSpent).toBeCloseTo(98.33, 1);
      
      expect(result.budgets).toHaveLength(2);
      expect(result.budgets[0]).toEqual({
        ...mockBudgets[0],
        spentAmount: 400,
        remainingAmount: 100,
        percentageSpent: 80,
        isOverBudget: false,
      });
      expect(result.budgets[1]).toEqual({
        ...mockBudgets[1],
        spentAmount: 350,
        remainingAmount: -50,
        percentageSpent: 116.67,
        isOverBudget: true,
      });
    });
  });

  describe('getBudgetCategories', () => {
    it('should return unique budget categories', async () => {
      const userId = 'user-123';

      const mockCategories = [
        { category: 'Food & Dining' },
        { category: 'Transportation' },
        { category: 'Entertainment' },
      ];

      prismaService.budget.findMany.mockResolvedValue(mockCategories);

      const result = await service.getBudgetCategories(userId);

      expect(result).toEqual(['Food & Dining', 'Transportation', 'Entertainment']);
    });
  });

  describe('getBudgetMonths', () => {
    it('should return unique budget months', async () => {
      const userId = 'user-123';

      const mockMonths = [
        { month: '2024-01' },
        { month: '2024-02' },
        { month: '2024-03' },
      ];

      prismaService.budget.findMany.mockResolvedValue(mockMonths);

      const result = await service.getBudgetMonths(userId);

      expect(result).toEqual(['2024-01', '2024-02', '2024-03']);
    });
  });
});
