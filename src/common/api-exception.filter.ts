import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { formatLogEntry, sanitizeForLog } from './log-sanitizer';

interface HttpRequest {
  method?: string;
  path?: string;
  body?: unknown;
  query?: Record<string, unknown>;
  apiLogStartedAt?: number;
}

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<HttpRequest>();
    const response = http.getResponse<HttpResponse>();
    const route = request.path ?? 'ruta desconocida';

    let status = 500;
    let responseBody: unknown = {
      statusCode: 500,
      message: 'Error interno del servidor',
    };
    let errorName = 'UnknownError';

    if (exception instanceof QueryFailedError) {
      const code = (exception.driverError as { code?: string }).code;
      errorName = `DatabaseError${code ? `(${code})` : ''}`;

      if (code === 'ER_DUP_ENTRY' || code === 'ER_ROW_IS_REFERENCED_2') {
        const error = new ConflictException(
          'El registro ya existe o tiene relaciones que impiden eliminarlo',
        );
        status = error.getStatus();
        responseBody = error.getResponse();
      } else if (
        code === 'ER_NO_REFERENCED_ROW_2' ||
        code === 'ER_CHECK_CONSTRAINT_VIOLATED'
      ) {
        const error = new UnprocessableEntityException(
          'Datos incompatibles con las relaciones o reglas de la base',
        );
        status = error.getStatus();
        responseBody = error.getResponse();
      } else {
        responseBody = {
          statusCode: status,
          message: 'Error de base de datos',
        };
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseBody = exception.getResponse();
      errorName = exception.name;
    } else if (exception instanceof Error) {
      errorName = exception.name;
    }

    const entry = {
      event: 'http_request_failed',
      method: request.method ?? 'UNKNOWN',
      httpEndpoint: route,
      statusCode: status,
      ...(request.apiLogStartedAt
        ? { durationMs: Date.now() - request.apiLogStartedAt }
        : {}),
      ...(request.query && Object.keys(request.query).length
        ? { query: sanitizeForLog(request.query) }
        : {}),
      ...(request.body && Object.keys(request.body as object).length
        ? { body: sanitizeForLog(request.body) }
        : {}),
      error: errorName,
      result: sanitizeForLog(responseBody),
    };
    const logMessage = formatLogEntry(entry);
    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(logMessage, stack);
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json(responseBody);
  }
}
