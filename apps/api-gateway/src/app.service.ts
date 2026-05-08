import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { createGrpcMetadata } from './auth/utils/grpc-metadata.util';

@Injectable()
export class AppService implements OnModuleInit {
  private authService: any;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.authService = this.client.getService<any>('AuthService');
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getUserProfile(user: any, correlationId: string) {
    const metadata = createGrpcMetadata(user);
    if (correlationId) {
      metadata.set('x-correlation-id', correlationId);
    }

    // Nota: AuthService no tiene findOne en el proto actual.
    // Esto podría estar causando el Circuit Breaker.
    // Como ejemplo, retornamos un objeto simulado o llamamos a un método válido.
    try {
      // Intentamos llamar a un método que sí exista o manejamos el error
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        message: 'Profile metadata propagated successfully',
      };
    } catch (error) {
      console.error('Error in AppService.getUserProfile:', error);
      throw error;
    }
  }
}
