import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthService');
  const grpcUrl = process.env.AUTH_SERVICE_GRPC_URL || '0.0.0.0:50051';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.AUTH,
      protoPath: PROTO_PATH.AUTH,
      url: grpcUrl,
    },
  });

  await app.listen();
  logger.log(`Auth Microservice is listening on: ${grpcUrl}`);
}
bootstrap();
