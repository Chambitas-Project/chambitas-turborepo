import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const httpPort = process.env.NOTIFICATION_SERVICE_PORT || 3005;
  await app.listen(httpPort);

  console.log(`Notification Service (HTTP) is running on port: ${httpPort}`);
}
bootstrap();
