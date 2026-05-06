import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class GrpcContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const metadata = context.switchToRpc().getContext() as Metadata;
      const metadataMap = metadata.getMap();

      const userId = metadataMap['user-id'];
      const role = metadataMap['role'];

      const request = context.switchToRpc().getData();
      
      // Inyectamos el contexto de usuario en el objeto de datos/petición
      if (request) {
        request['user'] = {
          id: userId,
          role: role,
        };
      }
    }

    return next.handle();
  }
}
