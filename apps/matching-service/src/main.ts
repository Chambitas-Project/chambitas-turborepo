import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from '@chambitas/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app, {
    title: 'Matching Service',
    description: 'Algoritmos de emparejamiento entre candidatos y ofertas.',
    version: '1.0.0',
    tag: 'Matching',
  });

  const httpPort = process.env.MATCHING_SERVICE_HTTP_PORT || 3004;
  await app.listen(httpPort);
  
  console.log(`Matching Service (HTTP/Swagger) is running on port: ${httpPort}`);
}
bootstrap();
