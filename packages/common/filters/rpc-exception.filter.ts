import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { throwError } from 'rxjs';

@Catch()
export class GlobalRpcExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost): any {
    // Si ya es un HttpException (ej. lanzado por class-validator o Guards)
    if (error instanceof HttpException && host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      return response.status(error.getStatus()).json(error.getResponse());
    }

    if (host.getType() !== 'http') {
      return throwError(() => error);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const grpcCode = error.code;
    const message = error.details || error.message || 'Internal Server Error';

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (grpcCode) {
      case 1: // CANCELLED
        status = 499;
        break;
      case 3: // INVALID_ARGUMENT
        status = HttpStatus.BAD_REQUEST;
        break;
      case 4: // DEADLINE_EXCEEDED
        status = HttpStatus.GATEWAY_TIMEOUT;
        break;
      case 5: // NOT_FOUND
        status = HttpStatus.NOT_FOUND;
        break;
      case 6: // ALREADY_EXISTS
        status = HttpStatus.CONFLICT;
        break;
      case 7: // PERMISSION_DENIED
        status = HttpStatus.FORBIDDEN;
        break;
      case 8: // RESOURCE_EXHAUSTED
        status = HttpStatus.TOO_MANY_REQUESTS;
        break;
      case 9: // FAILED_PRECONDITION
        status = HttpStatus.PRECONDITION_FAILED;
        break;
      case 10: // ABORTED
        status = HttpStatus.CONFLICT;
        break;
      case 11: // OUT_OF_RANGE
        status = HttpStatus.BAD_REQUEST;
        break;
      case 12: // UNIMPLEMENTED
        status = HttpStatus.NOT_IMPLEMENTED;
        break;
      case 13: // INTERNAL
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
      case 14: // UNAVAILABLE
        status = HttpStatus.SERVICE_UNAVAILABLE;
        break;
      case 15: // DATA_LOSS
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
      case 16: // UNAUTHENTICATED
        status = HttpStatus.UNAUTHORIZED;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
