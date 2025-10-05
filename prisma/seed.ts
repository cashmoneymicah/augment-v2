import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      planType: 'free',
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create a test account
  const account = await prisma.account.upsert({
    where: { id: 'test-account-1' },
    update: {},
    create: {
      id: 'test-account-1',
      userId: user.id,
      type: 'checking',
      name: 'Test Checking Account',
      institutionName: 'Test Bank',
      currency: 'CAD',
      balance: 1000.00,
    },
  });

  console.log('✅ Created test account:', account.name);

  // Create some test transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        accountId: account.id,
        postedAt: new Date('2024-01-15'),
        amount: -50.00,
        type: 'debit',
        merchant: 'Grocery Store',
        normalizedName: 'Groceries',
        category: 'Food',
        notes: 'Weekly groceries',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: account.id,
        postedAt: new Date('2024-01-16'),
        amount: 2000.00,
        type: 'credit',
        merchant: 'Employer',
        normalizedName: 'Salary',
        category: 'Income',
        notes: 'Monthly salary',
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: account.id,
        postedAt: new Date('2024-01-17'),
        amount: -25.00,
        type: 'debit',
        merchant: 'Gas Station',
        normalizedName: 'Gas',
        category: 'Transportation',
        notes: 'Fuel',
      },
    }),
  ]);

  console.log('✅ Created test transactions:', transactions.length);

  // Create a test budget
  const budget = await prisma.budget.upsert({
    where: {
      userId_month_category: {
        userId: user.id,
        month: '2024-01',
        category: 'Food',
      },
    },
    update: {},
    create: {
      userId: user.id,
      month: '2024-01',
      category: 'Food',
      limitAmount: 500.00,
      spentAmount: 50.00,
    },
  });

  console.log('✅ Created test budget:', budget.category);

  // Create a test goal
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Emergency Fund',
      targetAmount: 10000.00,
      currentSaved: 2500.00,
      targetDate: new Date('2024-12-31'),
    },
  });

  console.log('✅ Created test goal:', goal.name);

  // Create a test insight
  const insight = await prisma.insight.create({
    data: {
      userId: user.id,
      kind: 'spending',
      payload: {
        totalSpent: 75.00,
        topCategory: 'Food',
        monthlyTrend: 'increasing',
        recommendations: ['Reduce dining out', 'Set grocery budget'],
      },
    },
  });

  console.log('✅ Created test insight:', insight.kind);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
