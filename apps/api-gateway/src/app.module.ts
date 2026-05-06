import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrpcCircuitBreakerInterceptor, CorrelationIdInterceptor } from '@chambitas/common';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api-gateway/.env'],
    }),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.USER,
          protoPath: PROTO_PATH.USER,
          url: process.env.AUTH_SERVICE_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcCircuitBreakerInterceptor,
    },
  ],
})
export class AppModule {}
