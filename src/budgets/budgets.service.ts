import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto, GetBudgetsQueryDto } from './dto/budgets.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async getBudgets(userId: string, query: GetBudgetsQueryDto) {
    const { month, category, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId,
    };

    if (month) {
      where.month = month;
    }

    if (category) {
      where.category = category;
    }

    const [budgets, total] = await Promise.all([
      this.prisma.budget.findMany({
        where,
        orderBy: [
          { month: 'desc' },
          { category: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.budget.count({ where }),
    ]);

    // Compute spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spentAmount = await this.computeSpent(userId, budget.month, budget.category);
        return {
          ...budget,
          spentAmount,
        };
      })
    );

    return {
      budgets: budgetsWithSpent,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async createBudget(userId: string, createBudgetDto: CreateBudgetDto) {
    const { month, category, limitAmount } = createBudgetDto;

    // Check if budget already exists for this month and category
    const existingBudget = await this.prisma.budget.findUnique({
      where: {
        userId_month_category: {
          userId,
          month,
          category,
        },
      },
    });

    if (existingBudget) {
      throw new ConflictException('Budget already exists for this month and category');
    }

    const budget = await this.prisma.budget.create({
      data: {
        userId,
        month,
        category,
        limitAmount,
        spentAmount: 0,
      },
    });

    // Compute initial spent amount
    const spentAmount = await this.computeSpent(userId, month, category);

    return {
      ...budget,
      spentAmount,
    };
  }

  async updateBudget(userId: string, budgetId: string, updateBudgetDto: UpdateBudgetDto) {
    const { limitAmount } = updateBudgetDto;

    // Verify budget belongs to user
    const existingBudget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existingBudget) {
      throw new NotFoundException('Budget not found');
    }

    const budget = await this.prisma.budget.update({
      where: {
        id: budgetId,
      },
      data: {
        ...(limitAmount && { limitAmount }),
      },
    });

    // Compute current spent amount
    const spentAmount = await this.computeSpent(userId, budget.month, budget.category);

    return {
      ...budget,
      spentAmount,
    };
  }

  async deleteBudget(userId: string, budgetId: string) {
    // Verify budget belongs to user
    const existingBudget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existingBudget) {
      throw new NotFoundException('Budget not found');
    }

    await this.prisma.budget.delete({
      where: {
        id: budgetId,
      },
    });

    return { success: true };
  }

  async getBudgetById(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Compute current spent amount
    const spentAmount = await this.computeSpent(userId, budget.month, budget.category);

    return {
      ...budget,
      spentAmount,
    };
  }

  async computeSpent(userId: string, month: string, category: string): Promise<number> {
    // Parse month to get start and end dates
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Aggregate transactions for this user, month, and category
    const result = await this.prisma.transaction.aggregate({
      where: {
        account: {
          userId,
        },
        postedAt: {
          gte: startDate,
          lte: endDate,
        },
        category: category,
        type: 'debit', // Only count debits (spending)
      },
      _sum: {
        amount: true,
      },
    });

    // Return absolute value of spent amount (since debits are negative)
    return Math.abs(Number(result._sum.amount || 0));
  }

  async getBudgetStats(userId: string, month?: string) {
    const where: any = {
      userId,
    };

    if (month) {
      where.month = month;
    }

    const budgets = await this.prisma.budget.findMany({
      where,
      orderBy: [
        { month: 'desc' },
        { category: 'asc' },
      ],
    });

    // Compute spent amounts and budget status
    const budgetsWithStats = await Promise.all(
      budgets.map(async (budget) => {
        const spentAmount = await this.computeSpent(userId, budget.month, budget.category);
        const remainingAmount = Number(budget.limitAmount) - spentAmount;
        const percentageSpent = Number(budget.limitAmount) > 0 ? (spentAmount / Number(budget.limitAmount)) * 100 : 0;
        const isOverBudget = spentAmount > Number(budget.limitAmount);

        return {
          ...budget,
          spentAmount,
          remainingAmount,
          percentageSpent: Math.round(percentageSpent * 100) / 100,
          isOverBudget,
        };
      })
    );

    // Calculate summary statistics
    const totalBudgets = budgetsWithStats.length;
    const totalLimitAmount = budgetsWithStats.reduce((sum, budget) => sum + Number(budget.limitAmount), 0);
    const totalSpentAmount = budgetsWithStats.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const totalRemainingAmount = totalLimitAmount - totalSpentAmount;
    const overBudgetCount = budgetsWithStats.filter(budget => budget.isOverBudget).length;

    return {
      summary: {
        totalBudgets,
        totalLimitAmount,
        totalSpentAmount,
        totalRemainingAmount,
        overBudgetCount,
        averagePercentageSpent: totalBudgets > 0 ? 
          Math.round((budgetsWithStats.reduce((sum, budget) => sum + budget.percentageSpent, 0) / totalBudgets) * 100) / 100 : 0,
      },
      budgets: budgetsWithStats,
    };
  }

  async getBudgetCategories(userId: string) {
    const categories = await this.prisma.budget.findMany({
      where: {
        userId,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return categories.map(c => c.category);
  }

  async getBudgetMonths(userId: string) {
    const months = await this.prisma.budget.findMany({
      where: {
        userId,
      },
      select: {
        month: true,
      },
      distinct: ['month'],
      orderBy: {
        month: 'desc',
      },
    });

    return months.map(m => m.month);
  }
}
