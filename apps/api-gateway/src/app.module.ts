import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AppService } from './app.service';
import { ProfileController } from './profile/profile.controller';
import { MediaController } from './media/media.controller';
import { GrpcCircuitBreakerInterceptor, CorrelationIdInterceptor, getEnvFiles } from '@chambitas/common';
import { PROTO_PATH, PROTO_PACKAGE } from '@chambitas/proto';
import { MarketplaceController } from './marketplace/marketplace.controller';
import { ProjectsController } from './marketplace/projects.controller';
import { ApplicationsController } from './marketplace/applications.controller';
import { MatchingController } from './matching/matching.controller';
import { NotificationController } from './notification/notification.controller';
import { AnalyticsController } from './analytics/analytics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFiles(),
    }),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.AUTH,
          protoPath: PROTO_PATH.AUTH,
          url: process.env.AUTH_SERVICE_GRPC_URL || 'localhost:50051',
        },
      },
      {
        name: 'PROFILE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.PROFILE,
          protoPath: PROTO_PATH.PROFILE,
          url: process.env.PROFILE_SERVICE_GRPC_URL || 'localhost:50052',
        },
      },
      {
        name: 'MEDIA_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.MEDIA,
          protoPath: PROTO_PATH.MEDIA,
          url: process.env.MEDIA_SERVICE_GRPC_URL || 'localhost:50056',
        },
      },
      {
        name: 'MARKETPLACE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.MARKETPLACE,
          protoPath: PROTO_PATH.MARKETPLACE,
          url: process.env.MARKETPLACE_SERVICE_GRPC_URL || 'localhost:50054',
        },
      },
      {
        name: 'MATCHING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.MATCHING,
          protoPath: PROTO_PATH.MATCHING,
          url: process.env.MATCHING_SERVICE_GRPC_URL || 'localhost:50053',
        },
      },
      {
        name: 'NOTIFICATION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.NOTIFICATION,
          protoPath: PROTO_PATH.NOTIFICATION,
          url: process.env.NOTIFICATION_SERVICE_GRPC_URL || 'localhost:50055',
        },
      },
      {
        name: 'ANALYTICS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: PROTO_PACKAGE.ANALYTICS,
          protoPath: PROTO_PATH.ANALYTICS,
          url: process.env.ANALYTICS_AUDIT_SERVICE_GRPC_URL || 'localhost:50057',
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    ProfileController,
    MediaController,
    MarketplaceController,
    ProjectsController,
    ApplicationsController,
    MatchingController,
    NotificationController,
    AnalyticsController,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcCircuitBreakerInterceptor,
    },
  ],
})
export class AppModule { }
