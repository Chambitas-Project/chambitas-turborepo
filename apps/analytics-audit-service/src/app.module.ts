import { Module } from '@nestjs/common';
import { AnalyticsAuditController } from './app.controller';
import { AnalyticsAuditService } from './app.service';

@Module({
  imports: [],
  controllers: [AnalyticsAuditController],
  providers: [AnalyticsAuditService],
})
export class AnalyticsAuditModule {}
