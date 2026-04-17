import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el Front-end
  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`API Gateway is running on port: ${port}`);
}
bootstrap();
