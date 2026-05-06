import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  tag?: string;
  path?: string;
}

/**
 * Utilidad estandarizada para inicializar Swagger en los microservicios de Chambitas.
 */
export function setupSwagger(
  app: INestApplication,
  config: SwaggerConfig,
  isProduction: boolean = process.env.NODE_ENV === 'production',
): void {
  // En producción, podríamos querer desactivar Swagger por seguridad o requerir credenciales
  if (isProduction) {
    Logger.log('Swagger is disabled in production environment', 'SwaggerSetup');
    return;
  }

  const path = config.path || 'api/docs';
  
  const options = new DocumentBuilder()
    .setTitle(`Chambitas - ${config.title}`)
    .setDescription(config.description)
    .setVersion(config.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Introduce tu token de Supabase Auth',
        in: 'header',
      },
      'JWT-auth', // Este es el ID de seguridad que se usa en los controladores @ApiBearerAuth('JWT-auth')
    );

  if (config.tag) {
    options.addTag(config.tag);
  }

  const document = SwaggerModule.createDocument(app, options.build());
  SwaggerModule.setup(path, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: `Docs | ${config.title}`,
  });

  Logger.log(`Swagger documentation available at: /${path}`, 'SwaggerSetup');
}
