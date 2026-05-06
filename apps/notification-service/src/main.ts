import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from '@chambitas/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app, {
    title: 'Notification Service',
    description: 'Envío de correos, notificaciones push y alertas.',
    version: '1.0.0',
    tag: 'Notification',
  });

  const httpPort = process.env.NOTIFICATION_SERVICE_HTTP_PORT || 3005;
  await app.listen(httpPort);
  
  console.log(`Notification Service (HTTP/Swagger) is running on port: ${httpPort}`);
}
bootstrap();
