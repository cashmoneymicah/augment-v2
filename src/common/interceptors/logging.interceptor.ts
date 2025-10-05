import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;
    
    // Generate correlation ID for this request
    const correlationId = uuidv4();
    (request as any).correlationId = correlationId;

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const contentLength = response.get('content-length');
        const responseTime = Date.now() - now;

        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength || 0}b - ${responseTime}ms - ${userAgent} ${ip}`,
          'HTTP',
          correlationId,
        );

        // Log request body for non-GET requests (excluding sensitive data)
        if (method !== 'GET' && body) {
          const sanitizedBody = this.sanitizeBody(body);
          this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`, 'HTTP', correlationId);
        }
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
