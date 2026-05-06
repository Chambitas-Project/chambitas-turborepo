import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from '@chambitas/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app, {
    title: 'Marketplace Service',
    description: 'Servicio para la gestión de ofertas de trabajo y postulaciones.',
    version: '1.0.0',
    tag: 'Marketplace',
  });

  const httpPort = process.env.MARKETPLACE_SERVICE_HTTP_PORT || 3003;
  await app.listen(httpPort);
  
  console.log(`Marketplace Service (HTTP/Swagger) is running on port: ${httpPort}`);
}
bootstrap();
