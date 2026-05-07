import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ProfileService');
  const grpcUrl = process.env.PROFILE_SERVICE_GRPC_URL || '0.0.0.0:50052';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.PROFILE,
      protoPath: PROTO_PATH.PROFILE,
      url: grpcUrl,
    },
  });

  await app.listen();
  logger.log(`Profile Microservice is listening on: ${grpcUrl}`);
}
bootstrap();
