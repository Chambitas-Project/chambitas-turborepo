import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IUserContext {
  id: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUserContext | null => {
    const type = ctx.getType();
    
    if (type === 'rpc') {
      // El interceptor colocará al usuario en el contexto de la llamada rpc
      // NestJS permite acceder al contexto rpc.
      const rpcContext = ctx.switchToRpc().getContext();
      // Buscamos el usuario que el interceptor inyectó en el contexto
      return rpcContext?.user || null;
    }
    
    // Fallback para HTTP si fuera necesario (aunque este es un decorador gRPC enfocado)
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);
