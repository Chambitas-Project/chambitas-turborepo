import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsAuditService {
  getHello(): string {
    return 'Hello World!';
  }
}
