import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AppService } from './app.service';
import { ProfileController } from './profile/profile.controller';
import { MediaController } from './media/media.controller';
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
          package: PROTO_PACKAGE.AUTH,
          protoPath: PROTO_PATH.AUTH,
          url: process.env.AUTH_SERVICE_GRPC_URL || 'localhost:50051',
        },
      },
      {
        name: 'PROFILE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.PROFILE,
          protoPath: PROTO_PATH.PROFILE,
          url: process.env.PROFILE_SERVICE_GRPC_URL || 'localhost:50052',
        },
      },
      {
        name: 'MEDIA_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.MEDIA,
          protoPath: PROTO_PATH.MEDIA,
          url: process.env.MEDIA_SERVICE_GRPC_URL || 'localhost:50056',
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController, ProfileController, MediaController],
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
