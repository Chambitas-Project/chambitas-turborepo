import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { Resend } from 'resend';
import { SupabaseModule } from '@chambitas/supabase';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailProcessor } from '../processors/email.processor';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule,
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailProcessor,
    {
      provide: 'RESEND_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Resend(configService.get<string>('RESEND_KEY'));
      },
      inject: [ConfigService],
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule { }
