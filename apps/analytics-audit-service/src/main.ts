import { NestFactory } from '@nestjs/core';
import { AnalyticsAuditModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsAuditModule);
  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();
