import { NestFactory } from '@nestjs/core';
import { AnalyticsAuditModule } from './app.module';
import { setupSwagger } from '@chambitas/common';

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsAuditModule);

  setupSwagger(app, {
    title: 'Analytics & Audit Service',
    description: 'Seguimiento de eventos y auditoría de acciones del sistema.',
    version: '1.0.0',
    tag: 'Analytics',
  });

  const httpPort = process.env.ANALYTICS_SERVICE_HTTP_PORT || 3006;
  await app.listen(httpPort);
  
  console.log(`Analytics Service (HTTP/Swagger) is running on port: ${httpPort}`);
}
bootstrap();
