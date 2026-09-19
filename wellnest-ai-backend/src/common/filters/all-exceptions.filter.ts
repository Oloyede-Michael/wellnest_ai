import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const errorName = exception instanceof Error ? exception.name : 'Unknown';
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    const logMessage = `${request.method} ${request.url} - ${status} - ${errorName}: ${errorMessage}`;

    const stack = exception instanceof Error && !(exception instanceof HttpException) ? exception.stack : undefined;
    if (stack) {
      this.logger.error(logMessage, stack);
    } else {
      this.logger.error(logMessage);
    }

    const extra: Record<string, unknown> = {};
    if (typeof message === 'object' && message !== null) {
      for (const [key, value] of Object.entries(message as Record<string, unknown>)) {
        if (key !== 'statusCode' && key !== 'message' && key !== 'error') {
          extra[key] = value;
        }
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as { message?: string }).message || message,
      ...extra,
    });
  }
}
