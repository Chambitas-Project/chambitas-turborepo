import { Metadata } from '@grpc/grpc-js';

/**
 * Crea un objeto Metadata de gRPC a partir de la información del usuario
 * autenticado. Esto permite que los microservicios sean stateless.
 */
export function createGrpcMetadata(user: { id: string; role: string }): Metadata {
  const metadata = new Metadata();
  if (user.id) metadata.set('user-id', user.id);
  if (user.role) metadata.set('role', user.role);
  return metadata;
}
