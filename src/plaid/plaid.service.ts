import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PlaidApi, Configuration, PlaidEnvironments, LinkTokenCreateRequest, ItemPublicTokenExchangeRequest, TransactionsGetRequest, Products, CountryCode } from 'plaid';

@Injectable()
export class PlaidService {
  private readonly logger = new Logger(PlaidService.name);
  private plaidClient: PlaidApi;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const configuration = new Configuration({
      basePath: PlaidEnvironments[this.configService.get('PLAID_ENVIRONMENT') as keyof typeof PlaidEnvironments],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': this.configService.get('PLAID_CLIENT_ID'),
          'PLAID-SECRET': this.configService.get('PLAID_SECRET'),
        },
      },
    });

    this.plaidClient = new PlaidApi(configuration);
  }

  async createLinkToken(userId: string): Promise<{ link_token: string }> {
    try {
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: userId,
        },
        client_name: 'Personal Finance Platform',
        products: [Products.Transactions, Products.Auth],
        country_codes: [CountryCode.Ca],
        language: 'en',
        webhook: 'https://example.com/webhook', // TODO: Add to config schema
      };

      const response = await this.plaidClient.linkTokenCreate(request);
      
      this.logger.log(`Link token created for user ${userId}`);
      
      return {
        link_token: response.data.link_token,
      };
    } catch (error) {
      this.logger.error(`Failed to create link token for user ${userId}:`, error);
      throw error;
    }
  }

  async exchangePublicToken(publicToken: string, userId: string): Promise<{ success: boolean; accounts: any[] }> {
    try {
      const request: ItemPublicTokenExchangeRequest = {
        public_token: publicToken,
      };

      const response = await this.plaidClient.itemPublicTokenExchange(request);
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // Get account information
      const accountsResponse = await this.plaidClient.accountsGet({
        access_token: accessToken,
      });

      const accounts = accountsResponse.data.accounts;

      // Use database transaction for multi-step operation
      const createdAccounts = await this.prisma.$transaction(async (tx) => {
        const createdAccounts = [];
        
        for (const account of accounts) {
          const createdAccount = await tx.account.create({
            data: {
              userId,
              type: account.type,
              name: account.name,
              institutionName: account.official_name || 'Unknown Institution',
              currency: 'CAD',
              balance: account.balances.current || 0,
              plaidItemId: itemId,
              plaidAccountId: account.account_id,
              lastSyncedAt: new Date(),
            },
          });
          createdAccounts.push(createdAccount);
        }
        
        return createdAccounts;
      });

      this.logger.log(`Exchanged public token for user ${userId}, created ${createdAccounts.length} accounts`);

      return {
        success: true,
        accounts: createdAccounts,
      };
    } catch (error) {
      this.logger.error(`Failed to exchange public token for user ${userId}:`, error);
      throw error;
    }
  }

  async syncTransactions(accountId: string): Promise<{ success: boolean; transactions: any[] }> {
    try {
      // Get account from database
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account || !account.plaidItemId) {
        throw new Error('Account not found or not linked to Plaid');
      }

      // Get access token from Plaid (in real implementation, you'd store this)
      // For now, we'll use a mock approach
      const accessToken = 'mock-access-token';

      const request: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        end_date: new Date().toISOString().split('T')[0],
      };

      const response = await this.plaidClient.transactionsGet(request);
      const transactions = response.data.transactions;

      // Normalize and categorize transactions
      const normalizedTransactions = [];
      for (const transaction of transactions) {
        const normalizedTransaction = {
          accountId,
          postedAt: new Date(transaction.date),
          amount: transaction.amount,
          type: transaction.amount > 0 ? 'credit' : 'debit',
          merchant: transaction.merchant_name || transaction.name,
          normalizedName: this.normalizeTransactionName(transaction.name),
          rawCategory: transaction.category?.[0] || 'uncategorized',
          category: this.categorizeTransaction(transaction),
          notes: transaction.name,
          isManual: false,
        };

        // Upsert transaction
        const upsertedTransaction = await this.prisma.transaction.upsert({
          where: {
            // Assuming we have a unique constraint on accountId + postedAt + amount
            id: `${accountId}-${transaction.transaction_id}`,
          },
          update: normalizedTransaction,
          create: {
            ...normalizedTransaction,
            id: `${accountId}-${transaction.transaction_id}`,
          },
        });

        normalizedTransactions.push(upsertedTransaction);
      }

      // Update last synced timestamp
      await this.prisma.account.update({
        where: { id: accountId },
        data: { lastSyncedAt: new Date() },
      });

      this.logger.log(`Synced ${normalizedTransactions.length} transactions for account ${accountId}`);

      return {
        success: true,
        transactions: normalizedTransactions,
      };
    } catch (error) {
      this.logger.error(`Failed to sync transactions for account ${accountId}:`, error);
      throw error;
    }
  }

  private normalizeTransactionName(name: string): string {
    // Simple normalization - remove common prefixes/suffixes
    return name
      .toLowerCase()
      .replace(/^(debit|credit|payment|transfer)\s+/i, '')
      .replace(/\s+(debit|credit|payment|transfer)$/i, '')
      .trim();
  }

  private categorizeTransaction(transaction: any): string {
    // Simple categorization logic
    const categories = transaction.category || [];
    const merchant = transaction.merchant_name || transaction.name || '';

    // Map Plaid categories to our categories
    const categoryMap: Record<string, string> = {
      'Food and Drink': 'food',
      'Transportation': 'transportation',
      'Shops': 'shopping',
      'Entertainment': 'entertainment',
      'Healthcare': 'healthcare',
      'Travel': 'travel',
      'Financial': 'financial',
      'Recreation': 'recreation',
      'Service': 'services',
      'Tax': 'taxes',
    };

    if (categories.length > 0) {
      const primaryCategory = categories[0];
      return categoryMap[primaryCategory] || 'other';
    }

    // Fallback to merchant name analysis
    const merchantLower = merchant.toLowerCase();
    if (merchantLower.includes('grocery') || merchantLower.includes('food')) return 'food';
    if (merchantLower.includes('gas') || merchantLower.includes('fuel')) return 'transportation';
    if (merchantLower.includes('amazon') || merchantLower.includes('store')) return 'shopping';

    return 'other';
  }
}
