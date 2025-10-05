import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WinstonLoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, context, correlationId, ...meta }) => {
          const logObject = {
            timestamp,
            level,
            message,
            context: context || 'Application',
            correlationId: correlationId || this.generateCorrelationId(),
            ...meta,
          };
          return JSON.stringify(logObject);
        }),
      ),
      defaultMeta: { 
        service: 'augment-finance-api',
        correlationId: this.generateCorrelationId(),
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  private generateCorrelationId(): string {
    return uuidv4();
  }

  log(message: string, context?: string, correlationId?: string) {
    this.logger.info(message, { context, correlationId });
  }

  error(message: string, trace?: string, context?: string, correlationId?: string) {
    this.logger.error(message, { trace, context, correlationId });
  }

  warn(message: string, context?: string, correlationId?: string) {
    this.logger.warn(message, { context, correlationId });
  }

  debug(message: string, context?: string, correlationId?: string) {
    this.logger.debug(message, { context, correlationId });
  }

  verbose(message: string, context?: string, correlationId?: string) {
    this.logger.verbose(message, { context, correlationId });
  }

  // Method to create child logger with specific correlation ID
  createChildLogger(correlationId: string): winston.Logger {
    return this.logger.child({ correlationId });
  }

  // Method to log with specific correlation ID
  logWithCorrelationId(message: string, correlationId: string, context?: string) {
    this.logger.info(message, { context, correlationId });
  }
}
