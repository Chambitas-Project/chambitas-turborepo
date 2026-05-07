import { NestFactory } from '@nestjs/core';
import { AnalyticsAuditModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsAuditModule);


  const httpPort = process.env.ANALYTICS_AUDIT_SERVICE_PORT || 3006;
  await app.listen(httpPort);

  console.log(`Analytics Service (HTTP) is running on port: ${httpPort}`);
}
bootstrap();
