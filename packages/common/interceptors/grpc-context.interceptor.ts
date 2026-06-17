import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Metadata, status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class GrpcContextInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'rpc') {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      const metadata = context.switchToRpc().getContext() as Metadata;
      const metadataMap = metadata.getMap();

      const userId = metadataMap['user-id'] as string;
      const role = metadataMap['role'] as string;
      const systemToken = metadataMap['system-token'] as string;

      // Bypass para identidad de sistema (ej. procesos en segundo plano)
      if (systemToken === process.env.INTERNAL_SYSTEM_TOKEN && !userId) {
        const rpcContext = context.switchToRpc().getContext();
        rpcContext.user = { id: 'system', role: 'system' };
        return next.handle();
      }

      if (!isPublic && (!userId || !role)) {
        throw new RpcException({
          code: status.UNAUTHENTICATED,
          message: 'Missing or invalid authentication metadata',
        });
      }

      // Inyectamos el contexto de usuario en el objeto de contexto RPC 
      // para que el decorador @CurrentUser pueda extraerlo.
      // NestJS gRPC usa el objeto metadata como contexto base.
      // Podemos añadir propiedades personalizadas al objeto de contexto de Nest.
      const rpcContext = context.switchToRpc().getContext();
      rpcContext.user = userId ? { id: userId, role } : null;
    }

    return next.handle();
  }
}
