import { Metadata } from '@grpc/grpc-js';
import { IUserContext } from '../decorators/current-user.decorator';

export class GrpcMetadataForwarder {
  /**
   * Crea un objeto Metadata para una llamada saliente gRPC,
   * manteniendo la identidad del usuario actual.
   */
  static fromUser(user: IUserContext): Metadata {
    const metadata = new Metadata();
    if (user.id) metadata.set('user-id', user.id);
    if (user.role) metadata.set('role', user.role);
    
    // Si somos sistema, podemos añadir el token interno
    if (user.role === 'system' && process.env.INTERNAL_SYSTEM_TOKEN) {
      metadata.set('system-token', process.env.INTERNAL_SYSTEM_TOKEN);
    }
    
    return metadata;
  }
}
