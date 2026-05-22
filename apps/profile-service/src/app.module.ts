import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SupabaseModule } from '@chambitas/supabase';
import { CorrelationIdInterceptor, GrpcContextInterceptor, getEnvFiles } from '@chambitas/common';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFiles(),
    }),
    SupabaseModule,
    ProfileModule,
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
export class AppModule {}
