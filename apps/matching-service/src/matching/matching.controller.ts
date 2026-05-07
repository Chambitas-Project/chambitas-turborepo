import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MatchingService } from './matching.service';
import { GetRecommendationsRequest, GetRecommendationsResponse } from '@chambitas/proto';
import { Observable } from 'rxjs';

@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @GrpcMethod('MatchingService', 'GetRecommendations')
  getRecommendations(data: GetRecommendationsRequest): Observable<GetRecommendationsResponse> {
    return this.matchingService.getRecommendations(data);
  }
}
