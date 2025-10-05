import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategorizationService } from './categorization/categorization.service';
import { CreateTransactionDto, UpdateTransactionDto, GetTransactionsQueryDto } from './dto/transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private categorizationService: CategorizationService,
  ) {}

  async getTransactions(userId: string, query: GetTransactionsQueryDto) {
    const {
      startDate,
      endDate,
      category,
      accountId,
      page,
      limit,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      account: {
        userId,
      },
    };

    if (startDate || endDate) {
      where.postedAt = {};
      if (startDate) {
        where.postedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.postedAt.lte = new Date(endDate);
      }
    }

    if (category) {
      where.category = category;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
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
        orderBy: {
          postedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async createTransaction(userId: string, createTransactionDto: CreateTransactionDto) {
    const {
      accountId,
      postedAt,
      amount,
      type,
      merchant,
      normalizedName,
      rawCategory,
      category,
      notes,
      isManual,
    } = createTransactionDto;

    // Verify account belongs to user
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Auto-categorize if not provided
    let finalCategory = category;
    if (!finalCategory && merchant) {
      finalCategory = this.categorizationService.categorize(merchant);
    }

    // Normalize merchant name if not provided
    let finalNormalizedName = normalizedName;
    if (!finalNormalizedName && merchant) {
      finalNormalizedName = this.categorizationService.normalizeMerchantName(merchant);
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        accountId,
        postedAt: new Date(postedAt),
        amount,
        type,
        merchant,
        normalizedName: finalNormalizedName,
        rawCategory,
        category: finalCategory,
        notes,
        isManual,
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
    });

    return transaction;
  }

  async updateTransaction(userId: string, transactionId: string, updateTransactionDto: UpdateTransactionDto) {
    const { category, notes } = updateTransactionDto;

    // Verify transaction belongs to user
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: {
          userId,
        },
      },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    const transaction = await this.prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        ...(category && { category }),
        ...(notes !== undefined && { notes }),
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
    });

    return transaction;
  }

  async deleteTransaction(userId: string, transactionId: string) {
    // Verify transaction belongs to user
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: {
          userId,
        },
      },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });

    return { success: true };
  }

  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: {
          userId,
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
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getTransactionCategories(userId: string) {
    const categories = await this.prisma.transaction.findMany({
      where: {
        account: {
          userId,
        },
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return categories.map((c: any) => c.category).filter(Boolean);
  }

  async getTransactionStats(userId: string, startDate?: string, endDate?: string) {
    const where: any = {
      account: {
        userId,
      },
    };

    if (startDate || endDate) {
      where.postedAt = {};
      if (startDate) {
        where.postedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.postedAt.lte = new Date(endDate);
      }
    }

    const [totalTransactions, totalDebits, totalCredits, categoryStats] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'debit' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'credit' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['category'],
        where: {
          ...where,
          category: { not: null },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalTransactions,
      totalDebits: totalDebits._sum.amount || 0,
      totalCredits: totalCredits._sum.amount || 0,
      netAmount: Number(totalCredits._sum.amount || 0) - Number(totalDebits._sum.amount || 0),
      categoryStats: categoryStats.map((stat: any) => ({
        category: stat.category,
        totalAmount: stat._sum.amount || 0,
        transactionCount: stat._count.id,
      })),
    };
  }
}
