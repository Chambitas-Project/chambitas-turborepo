import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();
    let correlationId: string;

    if (type === 'http') {
      const request = context.switchToHttp().getRequest();
      correlationId = request.headers['x-correlation-id'] || uuidv4();
      request.headers['x-correlation-id'] = correlationId;
    } else if (type === 'rpc') {
      const metadata = context.switchToRpc().getContext() as Metadata;
      const metadataMap = metadata.getMap();
      correlationId = (metadataMap['x-correlation-id'] as string) || uuidv4();
      metadata.set('x-correlation-id', correlationId);
    } else {
      correlationId = uuidv4();
    }

    // Almacenamos el ID en el objeto de la petición para uso del Logger
    const req = context.switchToHttp().getRequest() || context.switchToRpc().getData();
    if (req) req['correlationId'] = correlationId;

    return next.handle();
  }
}
