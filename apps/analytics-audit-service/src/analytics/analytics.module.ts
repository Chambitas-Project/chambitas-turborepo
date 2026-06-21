import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SupabaseModule } from '@chambitas/supabase';
import { IntegrityCronService } from './integrity-cron.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, IntegrityCronService],
})
export class AnalyticsModule { }
