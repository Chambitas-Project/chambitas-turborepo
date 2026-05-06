import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AppService } from './app.service';
import { ProfileController } from './profile/profile.controller';
import { GrpcCircuitBreakerInterceptor, CorrelationIdInterceptor, getEnvFiles } from '@chambitas/common';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFiles(),
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
      {
        name: 'PROFILE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.USER,
          protoPath: PROTO_PATH.USER,
          url: process.env.PROFILE_SERVICE_URL || 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController, ProfileController],
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
export class AppModule { }
