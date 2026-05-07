import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.PROFILE,
      protoPath: PROTO_PATH.PROFILE,
      url: process.env.PROFILE_SERVICE_GRPC_URL || '0.0.0.0:50052',
    },
  });
  await app.startAllMicroservices();

  const httpPort = process.env.PROFILE_SERVICE_PORT || 3002;
  await app.listen(httpPort);

  console.log(`Profile Service (HTTP) is running on port: ${httpPort}`);
  console.log(`Profile Service (gRPC) is running on port: 50052`);
}
bootstrap();
