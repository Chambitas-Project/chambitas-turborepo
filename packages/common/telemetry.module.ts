import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PROTO_PACKAGE, PROTO_PATH } from '@chambitas/proto';
import { TelemetryInterceptor } from './interceptors/telemetry.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ANALYTICS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.ANALYTICS,
          protoPath: PROTO_PATH.ANALYTICS,
          url: process.env.ANALYTICS_AUDIT_SERVICE_GRPC_URL || 'localhost:50057',
          loader: { keepCase: true },
        },
      },
    ]),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TelemetryInterceptor,
    },
    {
      provide: 'SERVICE_NAME',
      useValue: process.env.SERVICE_NAME || 'unknown-service',
    }
  ],
  exports: [ClientsModule],
})
export class TelemetryModule {}
