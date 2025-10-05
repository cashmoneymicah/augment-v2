import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  PLAID_CLIENT_ID: z.string().min(1, 'PLAID_CLIENT_ID is required'),
  PLAID_SECRET: z.string().min(1, 'PLAID_SECRET is required'),
  PLAID_ENVIRONMENT: z.enum(['sandbox', 'development', 'production']).default('sandbox'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@augment-finance.com'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof configSchema>;

@Injectable()
export class ConfigurationService {
  private config!: Config;

  constructor(private configService: ConfigService) {
    this.validateConfig();
  }

  private validateConfig() {
    try {
      this.config = configSchema.parse({
        NODE_ENV: this.configService.get('NODE_ENV'),
        PORT: this.configService.get('PORT'),
        DATABASE_URL: this.configService.get('DATABASE_URL'),
        JWT_SECRET: this.configService.get('JWT_SECRET'),
        JWT_EXPIRES_IN: this.configService.get('JWT_EXPIRES_IN'),
        REDIS_URL: this.configService.get('REDIS_URL'),
        REDIS_PASSWORD: this.configService.get('REDIS_PASSWORD'),
        PLAID_CLIENT_ID: this.configService.get('PLAID_CLIENT_ID'),
        PLAID_SECRET: this.configService.get('PLAID_SECRET'),
        PLAID_ENVIRONMENT: this.configService.get('PLAID_ENVIRONMENT'),
        SMTP_HOST: this.configService.get('SMTP_HOST'),
        SMTP_PORT: this.configService.get('SMTP_PORT'),
        SMTP_USER: this.configService.get('SMTP_USER'),
        SMTP_PASS: this.configService.get('SMTP_PASS'),
        SMTP_FROM: this.configService.get('SMTP_FROM'),
        FRONTEND_URL: this.configService.get('FRONTEND_URL'),
        LOG_LEVEL: this.configService.get('LOG_LEVEL'),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
      }
      throw error;
    }
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  getAll(): Config {
    return this.config;
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}
