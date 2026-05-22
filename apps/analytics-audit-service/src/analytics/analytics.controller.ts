import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';
import { TrackEventRequest, TrackEventResponse } from '@chambitas/proto';
import { Observable } from 'rxjs';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @GrpcMethod('AnalyticsService', 'TrackEvent')
  trackEvent(data: TrackEventRequest): Observable<TrackEventResponse> {
    return this.analyticsService.trackEvent(data);
  }
}
