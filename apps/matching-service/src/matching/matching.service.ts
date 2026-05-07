import { Injectable, Logger } from '@nestjs/common';
import { GetRecommendationsRequest, GetRecommendationsResponse } from '@chambitas/proto';
import { of, Observable } from 'rxjs';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  getRecommendations(data: GetRecommendationsRequest): Observable<GetRecommendationsResponse> {
    this.logger.log(`Getting recommendations for user: ${data.userId}`);
    return of({ recommendations: [] });
  }
}
