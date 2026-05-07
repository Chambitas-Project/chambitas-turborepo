import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const grpcUrl = process.env.NOTIFICATION_SERVICE_GRPC_URL || '0.0.0.0:50055';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.NOTIFICATION,
      protoPath: PROTO_PATH.NOTIFICATION,
      url: grpcUrl,
    },
  });

  await app.listen();
  logger.log(`Notification Microservice is listening on: ${grpcUrl}`);
}
bootstrap();
