import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AnalyticsAuditModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AnalyticsAuditService');
  const grpcUrl = process.env.ANALYTICS_AUDIT_SERVICE_GRPC_URL || '0.0.0.0:50057';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AnalyticsAuditModule, {
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.ANALYTICS,
      protoPath: PROTO_PATH.ANALYTICS,
      url: grpcUrl,
      loader: { keepCase: true },
    },
  });

  await app.listen();
  logger.log(`Analytics Audit Microservice is listening on: ${grpcUrl}`);
}
bootstrap();
