import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const requestId = (request.headers['x-request-id'] as string) || uuidv4();
    response.setHeader('X-Request-ID', requestId);

    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.log(`[${requestId}] ${method} ${url} ${response.statusCode} - ${responseTime}ms`);
        },
        error: (error: { status?: number; message?: string }) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;
          this.logger.error(`[${requestId}] ${method} ${url} ${statusCode} - ${responseTime}ms - ${error.message}`);
        },
      }),
    );
  }
}
