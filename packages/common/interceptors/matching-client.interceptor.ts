import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GrpcMetadataForwarder } from '../utils/metadata-forwarder.util';
import { IUserContext } from '../decorators/current-user.decorator';

@Injectable()
export class GrpcMetadataForwarderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Este interceptor puede ser usado en el controlador para extraer el usuario
    // y tenerlo listo para pasar a los servicios.
    // Sin embargo, para gRPC saliente, usualmente pasamos el objeto Metadata manualmente.
    return next.handle();
  }
}

/**
 * Ejemplo de cómo se usaría en un servicio para propagar la identidad.
 */
export function forwardMetadata(user: IUserContext) {
  return GrpcMetadataForwarder.fromUser(user);
}
