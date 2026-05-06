import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { setupSwagger } from '@chambitas/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app, {
    title: 'Media Service',
    description: 'Microservicio encargado del procesamiento y subida de archivos.',
    version: '1.0.0',
    tag: 'Media',
  });

  const grpcPort = 50056; // Para no chocar con el 50051 de auth

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: PROTO_PACKAGE.MEDIA,
      protoPath: PROTO_PATH.MEDIA,
      url: process.env.MEDIA_SERVICE_GRPC_URL || `0.0.0.0:${grpcPort}`,
    },
  });

  await app.startAllMicroservices();
  const httpPort = process.env.MEDIA_SERVICE_PORT || 3006;
  await app.listen(httpPort);
  
  console.log(`Media Service (HTTP/Swagger) is running on port: ${httpPort}`);
  console.log(`Media Service (gRPC) is running on port: ${grpcPort}`);
}
bootstrap();
