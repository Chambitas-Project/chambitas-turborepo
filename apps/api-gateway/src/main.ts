import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger, GlobalRpcExceptionFilter } from '@chambitas/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar Middleware de Cookies
  app.use(cookieParser());

  // Habilitar Prefijo Global
  app.setGlobalPrefix('api/v1');

  // Habilitar Validación Global (class-validator) - Refreshed for Onboarding
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Permitir que class-validator use el contenedor de NestJS para inyección de dependencias
  const { useContainer } = require('class-validator');
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Habilitar Filtro de Excepciones Global (gRPC -> HTTP)
  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  // Habilitar Swagger
  setupSwagger(app as any, {
    title: 'API Gateway',
    description: 'Punto de entrada principal para el ecosistema de microservicios Chambitas.',
    version: '1.0.0',
    tag: 'Gateway',
  });

  // Habilitar CORS para el Front-end y Analytics Dashboard
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5174',
      process.env.DASHBOARD_URL || 'http://localhost:5173'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || process.env.API_GATEWAY_PORT || 3000;

  await app.listen(port, '0.0.0.0');
  console.log(`API Gateway is running on port: ${port}`);
}
bootstrap();
