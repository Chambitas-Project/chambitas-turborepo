import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { OWNER_FIELD_KEY } from '../decorators/resource.decorator';
import { IUserContext } from '../decorators/current-user.decorator';

@Injectable()
export class ProfileOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rpcContext = context.switchToRpc().getContext();
    const user = rpcContext.user as IUserContext;

    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'No user identity found in context',
      });
    }

    // Los administradores tienen acceso total
    if (user.role === 'admin' || user.role === 'system') {
      return true;
    }

    const fieldName = this.reflector.get<string>(OWNER_FIELD_KEY, context.getHandler());
    if (!fieldName) {
      // Si no hay decorador, permitimos el paso (o podrías denegarlo por seguridad)
      return true;
    }

    const data = context.switchToRpc().getData();
    const resourceOwnerId = data[fieldName];

    if (user.id !== resourceOwnerId) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'You do not have permission to modify this resource',
      });
    }

    return true;
  }
}
