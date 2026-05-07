import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const httpPort = process.env.MATCHING_SERVICE_PORT || 3003;
  await app.listen(httpPort);

  console.log(`Matching Service (HTTP) is running on port: ${httpPort}`);
}
bootstrap();
