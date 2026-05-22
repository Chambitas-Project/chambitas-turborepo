import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @GrpcMethod('UserService', 'FindOne')
  findOne(data: { id: string }, metadata: any, call: any) {
    // El GrpcContextInterceptor ha inyectado el usuario en data
    const userContext = (data as any).user;
    const correlationId = (data as any).correlationId;

    console.log(`[${correlationId}] Buscando usuario ${data.id} solicitado por ${userContext?.id}`);

    return {
      id: data.id,
      email: 'test@example.com',
      name: 'User Name',
    };
  }
}
