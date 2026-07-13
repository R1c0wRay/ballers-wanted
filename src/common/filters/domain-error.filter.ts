import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { DomainError } from '../../domain/common/domain.error';

@Catch()
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    // ✅ CAS 1 : erreurs HTTP NestJS (comme Unauthorized)
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const message = error.message;

      return response.status(status).json({
        errorCode: 'HTTP_ERROR',
        message,
      });
    }

    // ✅ CAS 2 : DomainError (ton métier)
    if (error instanceof DomainError) {

      if (error.code === 'TOKEN_EXPIRED') {

        const details =
          JSON.parse(error.message);

        return response.status(400).json({
          errorCode: error.code,
          ...details,
        });
      }

      return response.status(400).json({
        errorCode: error.code,
        message: 'Action not allowed',
      });
    }

    // ✅ CAS 3 : fallback
    console.error('🔥 UNKNOWN ERROR:', error);

    return response.status(500).json({
      errorCode: 'UNKNOWN_ERROR',
      message: 'Internal server error',
    });
  }
}