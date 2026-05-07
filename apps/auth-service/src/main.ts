import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PROTO_PATH } from '@chambitas/proto';

async function bootstrap() {
  // 1. Crear aplicación base (HTTP) para Swagger y Health Checks
  const app = await NestFactory.create(AppModule);


  // 3. Conectar el microservicio gRPC
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: PROTO_PATH.USER,
      url: process.env.AUTH_SERVICE_GRPC_URL || '0.0.0.0:50051',
    },
  });

  // 4. Iniciar ambos servidores
  await app.startAllMicroservices();
  const httpPort = process.env.AUTH_SERVICE_PORT || 3001;
  await app.listen(httpPort);

  console.log(`Auth Service (HTTP) is running on port: ${httpPort}`);
  console.log(`Auth Service (gRPC) is running on port: 50051`);
}
bootstrap();
