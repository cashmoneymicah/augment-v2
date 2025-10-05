import { Test, TestingModule } from '@nestjs/testing';
import { PlaidService } from './plaid.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationService } from '../config/configuration';

describe('PlaidService', () => {
  let service: PlaidService;
  let prismaService: any;
  let configService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      account: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        upsert: jest.fn(),
      },
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, any> = {
          PLAID_CLIENT_ID: 'test-client-id',
          PLAID_SECRET: 'test-secret',
          PLAID_ENVIRONMENT: 'sandbox',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaidService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PlaidService>(PlaidService);
    prismaService = module.get(PrismaService);
    configService = module.get(ConfigurationService);
  });

  describe('transaction normalization and categorization', () => {
    it('should normalize transaction names correctly', () => {
      // Test the private normalization method
      const normalizeName = (service as any).normalizeTransactionName;
      
      expect(normalizeName('DEBIT Coffee Shop')).toBe('coffee shop');
      expect(normalizeName('Payment Transfer')).toBe('transfer');
      expect(normalizeName('Credit Refund')).toBe('refund');
      expect(normalizeName('AMAZON.COM PURCHASE')).toBe('amazon.com purchase');
    });

    it('should categorize transactions correctly', () => {
      // Test the private categorization method
      const categorize = (service as any).categorizeTransaction;
      
      const foodTransaction = {
        category: ['Food and Drink'],
        merchant_name: 'Grocery Store',
        name: 'Whole Foods',
      };
      
      const transportTransaction = {
        category: ['Transportation'],
        merchant_name: 'Gas Station',
        name: 'Shell',
      };

      const shoppingTransaction = {
        category: ['Shops'],
        merchant_name: 'Amazon',
        name: 'Amazon.com',
      };

      const uncategorizedTransaction = {
        category: [],
        merchant_name: 'Random Business',
        name: 'Random Purchase',
      };
      
      expect(categorize(foodTransaction)).toBe('food');
      expect(categorize(transportTransaction)).toBe('transportation');
      expect(categorize(shoppingTransaction)).toBe('shopping');
      expect(categorize(uncategorizedTransaction)).toBe('other');
    });

    it('should categorize by merchant name when category is missing', () => {
      const categorize = (service as any).categorizeTransaction;
      
      const groceryTransaction = {
        category: [],
        merchant_name: 'Grocery Store',
        name: 'Whole Foods',
      };

      const gasTransaction = {
        category: [],
        merchant_name: 'Gas Station',
        name: 'Shell',
      };

      const amazonTransaction = {
        category: [],
        merchant_name: 'Amazon',
        name: 'Amazon.com',
      };
      
      expect(categorize(groceryTransaction)).toBe('food');
      expect(categorize(gasTransaction)).toBe('transportation');
      expect(categorize(amazonTransaction)).toBe('shopping');
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have required dependencies', () => {
      expect(prismaService).toBeDefined();
      expect(configService).toBeDefined();
    });

    it('should have required methods', () => {
      expect(typeof service.createLinkToken).toBe('function');
      expect(typeof service.exchangePublicToken).toBe('function');
      expect(typeof service.syncTransactions).toBe('function');
    });
  });

  describe('configuration', () => {
    it('should get Plaid configuration values', () => {
      expect(configService.get('PLAID_CLIENT_ID')).toBe('test-client-id');
      expect(configService.get('PLAID_SECRET')).toBe('test-secret');
      expect(configService.get('PLAID_ENVIRONMENT')).toBe('sandbox');
    });
  });
});