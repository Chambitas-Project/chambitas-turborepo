import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('MediaService');
  const grpcUrl = process.env.MEDIA_SERVICE_GRPC_URL || '0.0.0.0:50056';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.MEDIA,
      protoPath: PROTO_PATH.MEDIA,
      url: grpcUrl,
    },
  });

  await app.listen();
  logger.log(`Media Microservice is listening on: ${grpcUrl}`);
}
bootstrap();
