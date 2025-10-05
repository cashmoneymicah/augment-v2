import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetCashflowQueryDto, GetSpendingByCategoryQueryDto, GetNetworthQueryDto } from './dto/insights.dto';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async getCashflow(userId: string, query: GetCashflowQueryDto) {
    const { period } = query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = this.getStartDateForPeriod(period);

    // Get transactions grouped by month
    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: {
          userId,
        },
        postedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        postedAt: true,
        amount: true,
        type: true,
      },
      orderBy: {
        postedAt: 'asc',
      },
    });

    // Group transactions by month and calculate net
    const monthlyData = this.groupTransactionsByMonth(transactions);
    
    // Calculate summary statistics
    const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
    const netCashflow = totalIncome - totalExpenses;
    const averageMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
    const averageMonthlyExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;
    const averageMonthlyNet = monthlyData.length > 0 ? netCashflow / monthlyData.length : 0;

    return {
      period,
      startDate,
      endDate,
      summary: {
        totalIncome,
        totalExpenses,
        netCashflow,
        averageMonthlyIncome,
        averageMonthlyExpenses,
        averageMonthlyNet,
        monthCount: monthlyData.length,
      },
      monthlyData,
    };
  }

  async getSpendingByCategory(userId: string, query: GetSpendingByCategoryQueryDto) {
    const { month } = query;
    
    // Parse month to get start and end dates
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Get transactions grouped by category
    const categoryData = await this.prisma.transaction.groupBy({
      by: ['category'],
      where: {
        account: {
          userId,
        },
        postedAt: {
          gte: startDate,
          lte: endDate,
        },
        type: 'debit', // Only spending (debits)
        category: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Transform data and calculate percentages
    const totalSpending = categoryData.reduce((sum, item) => sum + Math.abs(Number(item._sum.amount || 0)), 0);
    
    const spendingByCategory = categoryData.map(item => {
      const amount = Math.abs(Number(item._sum.amount || 0));
      const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
      
      return {
        category: item.category,
        amount,
        transactionCount: item._count.id,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    return {
      month,
      startDate,
      endDate,
      summary: {
        totalSpending,
        categoryCount: spendingByCategory.length,
        averageTransactionAmount: spendingByCategory.length > 0 ? 
          totalSpending / spendingByCategory.reduce((sum, item) => sum + item.transactionCount, 0) : 0,
      },
      spendingByCategory,
    };
  }

  async getNetworth(userId: string, query: GetNetworthQueryDto) {
    const { asOfDate } = query;
    
    // Get all accounts for the user
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        institutionName: true,
      },
    });

    // Calculate networth by account type
    const networthByType = accounts.reduce((acc, account) => {
      const type = account.type;
      if (!acc[type]) {
        acc[type] = {
          totalBalance: 0,
          accountCount: 0,
          accounts: [],
        };
      }
      
      acc[type].totalBalance += Number(account.balance);
      acc[type].accountCount += 1;
      acc[type].accounts.push({
        id: account.id,
        name: account.name,
        balance: Number(account.balance),
        currency: account.currency,
        institutionName: account.institutionName,
      });
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate total networth
    const totalNetworth = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    
    // Calculate networth by currency
    const networthByCurrency = accounts.reduce((acc, account) => {
      const currency = account.currency || 'CAD';
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += Number(account.balance);
      return acc;
    }, {} as Record<string, number>);

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      summary: {
        totalNetworth,
        totalAccounts: accounts.length,
        currencyCount: Object.keys(networthByCurrency).length,
      },
      networthByType,
      networthByCurrency,
      accounts: accounts.map(account => ({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: Number(account.balance),
        currency: account.currency,
        institutionName: account.institutionName,
      })),
    };
  }

  async getSpendingTrends(userId: string, months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get monthly spending totals
    const monthlySpending = await this.prisma.transaction.groupBy({
      by: ['postedAt'],
      where: {
        account: {
          userId,
        },
        postedAt: {
          gte: startDate,
          lte: endDate,
        },
        type: 'debit',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Group by month and calculate trends
    const monthlyTrends = this.groupSpendingByMonth(monthlySpending);
    
    // Calculate trend analysis
    const trendAnalysis = this.calculateTrendAnalysis(monthlyTrends);

    return {
      period: `${months} months`,
      startDate,
      endDate,
      monthlyTrends,
      trendAnalysis,
    };
  }

  async getTopMerchants(userId: string, month?: string, limit: number = 10) {
    const where: any = {
      account: {
        userId,
      },
      type: 'debit',
      merchant: {
        not: null,
      },
    };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
      
      where.postedAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const topMerchants = await this.prisma.transaction.groupBy({
      by: ['merchant'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    return topMerchants.map(merchant => ({
      merchant: merchant.merchant,
      totalSpent: Math.abs(Number(merchant._sum.amount || 0)),
      transactionCount: merchant._count.id,
      averageTransactionAmount: Math.abs(Number(merchant._sum.amount || 0)) / merchant._count.id,
    }));
  }

  private getStartDateForPeriod(period: string): Date {
    const now = new Date();
    const startDate = new Date(now);
    
    switch (period) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '12months':
        startDate.setMonth(now.getMonth() - 12);
        break;
      case 'all':
        startDate.setFullYear(2020); // Start from 2020 for "all" period
        break;
      default:
        startDate.setMonth(now.getMonth() - 12);
    }
    
    return startDate;
  }

  private groupTransactionsByMonth(transactions: any[]): any[] {
    const monthlyMap = new Map<string, { income: number; expenses: number; transactions: any[] }>();
    
    transactions.forEach(transaction => {
      const monthKey = transaction.postedAt.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0, transactions: [] });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.transactions.push(transaction);
      
      if (transaction.type === 'credit') {
        monthData.income += Number(transaction.amount);
      } else {
        monthData.expenses += Math.abs(Number(transaction.amount));
      }
    });
    
    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
      transactionCount: data.transactions.length,
    }));
  }

  private groupSpendingByMonth(spendingData: any[]): any[] {
    const monthlyMap = new Map<string, { totalSpent: number; transactionCount: number }>();
    
    spendingData.forEach(item => {
      const monthKey = item.postedAt.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { totalSpent: 0, transactionCount: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.totalSpent += Math.abs(Number(item._sum.amount || 0));
      monthData.transactionCount += item._count.id;
    });
    
    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      totalSpent: data.totalSpent,
      transactionCount: data.transactionCount,
    }));
  }

  private calculateTrendAnalysis(monthlyTrends: any[]): any {
    if (monthlyTrends.length < 2) {
      return {
        trend: 'insufficient_data',
        changePercentage: 0,
        averageMonthlySpending: monthlyTrends[0]?.totalSpent || 0,
      };
    }
    
    const sortedTrends = monthlyTrends.sort((a, b) => a.month.localeCompare(b.month));
    const firstMonth = sortedTrends[0];
    const lastMonth = sortedTrends[sortedTrends.length - 1];
    
    const changeAmount = lastMonth.totalSpent - firstMonth.totalSpent;
    const changePercentage = firstMonth.totalSpent > 0 ? (changeAmount / firstMonth.totalSpent) * 100 : 0;
    
    const averageMonthlySpending = sortedTrends.reduce((sum, month) => sum + month.totalSpent, 0) / sortedTrends.length;
    
    let trend = 'stable';
    if (changePercentage > 10) trend = 'increasing';
    else if (changePercentage < -10) trend = 'decreasing';
    
    return {
      trend,
      changePercentage: Math.round(changePercentage * 100) / 100,
      changeAmount,
      averageMonthlySpending: Math.round(averageMonthlySpending * 100) / 100,
      firstMonth: firstMonth.month,
      lastMonth: lastMonth.month,
    };
  }
}
