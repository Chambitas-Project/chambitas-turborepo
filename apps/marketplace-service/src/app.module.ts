import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { ProjectsModule } from './features/projects/projects.module';
import { ApplicationsModule } from './features/applications/applications.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { CorrelationIdInterceptor, GrpcContextInterceptor, getEnvFiles } from '@chambitas/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFiles(),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        let host = configService.get<string>('REDISHOST', 'localhost');
        let port = configService.get<number>('REDISPORT', 6379);
        let password = configService.get<string>('REDISPASSWORD');

        if (redisUrl) {
          try {
            const url = new URL(redisUrl);
            host = url.hostname;
            port = parseInt(url.port, 10) || 6379;
            password = url.password || password;
          } catch (e) {
            // Ignore parse errors
          }
        }

        return {
          connection: { host, port, password },
        };
      },
    }),
    ProjectsModule,
    ApplicationsModule,
    ReviewsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcContextInterceptor,
    },
  ],
})
export class AppModule { }
