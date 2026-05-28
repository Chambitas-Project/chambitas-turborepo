import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
