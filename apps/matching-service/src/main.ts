import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('MatchingService');
  const grpcUrl = process.env.MATCHING_SERVICE_GRPC_URL || '0.0.0.0:50053';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.MATCHING,
      protoPath: PROTO_PATH.MATCHING,
      url: grpcUrl,
    },
  });

  await app.listen();
  logger.log(`Matching Microservice is listening on: ${grpcUrl}`);
}
bootstrap();
