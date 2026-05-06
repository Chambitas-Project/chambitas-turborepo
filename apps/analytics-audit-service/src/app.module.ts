import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AnalyticsAuditController } from './app.controller';
import { AnalyticsAuditService } from './app.service';
import { CorrelationIdInterceptor, GrpcContextInterceptor, getEnvFiles } from '@chambitas/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFiles(),
    }),
  ],
  controllers: [AnalyticsAuditController],
  providers: [
    AnalyticsAuditService,
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
export class AnalyticsAuditModule {}
