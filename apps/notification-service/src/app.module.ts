import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailProcessor } from './processors/email.processor';
import { CorrelationIdInterceptor, GrpcContextInterceptor, getEnvFiles } from '@chambitas/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFiles(),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get('REDIS_URL') || 'redis://localhost:6379',
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailProcessor,
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
