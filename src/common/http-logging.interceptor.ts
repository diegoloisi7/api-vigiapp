import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { formatLogEntry, sanitizeForLog } from './log-sanitizer';

interface LoggedRequest {
  method: string;
  path?: string;
  originalUrl?: string;
  query?: Record<string, unknown>;
  body?: unknown;
  apiLogStartedAt?: number;
}

interface LoggedResponse {
  statusCode: number;
}

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<LoggedRequest>();
    const response = http.getResponse<LoggedResponse>();
    request.apiLogStartedAt = Date.now();

    return next.handle().pipe(
      tap((result: unknown) => {
        const entry = {
          event: 'http_request_completed',
          method: request.method,
          httpEndpoint: (request.originalUrl ?? request.path ?? '').split('?')[0],
          statusCode: response.statusCode,
          durationMs: Date.now() - request.apiLogStartedAt!,
          ...(request.query && Object.keys(request.query).length
            ? { query: sanitizeForLog(request.query) }
            : {}),
          ...(request.body && Object.keys(request.body as object).length
            ? { body: sanitizeForLog(request.body) }
            : {}),
          result: result === undefined ? null : sanitizeForLog(result),
        };

        this.logger.log(formatLogEntry(entry));
      }),
    );
  }
}
