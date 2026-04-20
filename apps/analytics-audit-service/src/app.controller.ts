import { Controller, Get } from '@nestjs/common';
import { AnalyticsAuditService } from './app.service';

@Controller()
export class AnalyticsAuditController {
  constructor(private readonly appService: AnalyticsAuditService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
