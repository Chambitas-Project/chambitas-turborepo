import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

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
    const metadata = new Metadata();
    metadata.add('user-id', user.id);
    metadata.add('role', user.role);
    metadata.add('x-correlation-id', correlationId);

    return firstValueFrom(
      this.authService.findOne({ id: user.id }, metadata),
    );
  }
}
