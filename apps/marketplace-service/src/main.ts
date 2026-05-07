import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('MarketplaceService');
  const grpcUrl = process.env.MARKETPLACE_SERVICE_GRPC_URL || '0.0.0.0:50054';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.MARKETPLACE,
      protoPath: PROTO_PATH.MARKETPLACE,
      url: grpcUrl,
    },
  });

  await app.listen();
  logger.log(`Marketplace Microservice is listening on: ${grpcUrl}`);
}
bootstrap();
