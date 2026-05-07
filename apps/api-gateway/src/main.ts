import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '@chambitas/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar Swagger
  setupSwagger(app, {
    title: 'API Gateway',
    description: 'Punto de entrada principal para el ecosistema de microservicios Chambitas.',
    version: '1.0.0',
    tag: 'Gateway',
  });

  // Habilitar CORS para el Front-end
  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.API_GATEWAY_PORT || 3000;

  await app.listen(port);
  console.log(`API Gateway is running on port: ${port}`);
}
bootstrap();
