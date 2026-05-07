import { Injectable, Logger } from '@nestjs/common';
import { TrackEventRequest, TrackEventResponse } from '@chambitas/proto';
import { of, Observable } from 'rxjs';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  trackEvent(data: TrackEventRequest): Observable<TrackEventResponse> {
    this.logger.log(`Tracking event: ${data.eventType} from ${data.source}`);
    return of({ success: true });
  }
}
