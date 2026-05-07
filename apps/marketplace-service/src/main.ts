import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const httpPort = process.env.MARKETPLACE_SERVICE_PORT || 3004;
  await app.listen(httpPort);

  console.log(`Marketplace Service (HTTP) is running on port: ${httpPort}`);
}
bootstrap();
