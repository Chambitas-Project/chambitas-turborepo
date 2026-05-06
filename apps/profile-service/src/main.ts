import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { setupSwagger } from '@chambitas/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app, {
    title: 'Profile Service',
    description: 'Gestión de perfiles de usuario y currículums.',
    version: '1.0.0',
    tag: 'Profile',
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user', // Match PROTO_PACKAGE.USER since ProfileService is in user.proto
      protoPath: join(__dirname, '../../packages/proto/user.proto'), // Path to user.proto relative to dist/apps/profile-service
      url: process.env.PROFILE_SERVICE_GRPC_URL || '0.0.0.0:50052',
    },
  });
  await app.startAllMicroservices();

  const httpPort = process.env.PROFILE_SERVICE_HTTP_PORT || 3002;
  await app.listen(httpPort);
  
  console.log(`Profile Service (HTTP/Swagger) is running on port: ${httpPort}`);
}
bootstrap();
