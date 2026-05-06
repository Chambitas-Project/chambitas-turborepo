import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CorrelationIdInterceptor, GrpcContextInterceptor } from '@chambitas/common';

@Module({
  imports: [AuthModule],
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
