import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';
import { TrackEventRequest, TrackEventResponse, GetOverviewKPIsRequest, GetOverviewKPIsResponse, GetMLEngineKPIsRequest, GetMLEngineKPIsResponse, GetInfrastructureKPIsRequest, GetInfrastructureKPIsResponse } from '@chambitas/proto';
import { Observable } from 'rxjs';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @GrpcMethod('AnalyticsService', 'TrackEvent')
  trackEvent(data: TrackEventRequest): Observable<TrackEventResponse> {
    return this.analyticsService.trackEvent(data);
  }

  @GrpcMethod('AnalyticsService', 'GetOverviewKPIs')
  getOverviewKPIs(data: GetOverviewKPIsRequest): Observable<GetOverviewKPIsResponse> {
    return this.analyticsService.getOverviewKPIs(data);
  }

  @GrpcMethod('AnalyticsService', 'GetMLEngineKPIs')
  getMLEngineKPIs(data: GetMLEngineKPIsRequest): Observable<GetMLEngineKPIsResponse> {
    return this.analyticsService.getMLEngineKPIs(data);
  }

  @GrpcMethod('AnalyticsService', 'GetInfrastructureKPIs')
  getInfrastructureKPIs(data: GetInfrastructureKPIsRequest): Observable<GetInfrastructureKPIsResponse> {
    return this.analyticsService.getInfrastructureKPIs(data);
  }
}
