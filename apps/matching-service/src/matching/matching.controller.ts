import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MatchingService } from './matching.service';
import { GetRecommendationsRequest, GetRecommendationsResponse, UpdateMatchStatusRequest, UpdateMatchStatusResponse } from '@chambitas/proto';
import { Observable } from 'rxjs';

@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @GrpcMethod('MatchingService', 'GetRecommendations')
  getRecommendations(data: GetRecommendationsRequest): Promise<GetRecommendationsResponse> {
    return this.matchingService.getRecommendations(data);
  }

  @GrpcMethod('MatchingService', 'UpdateMatchStatus')
  updateMatchStatus(data: UpdateMatchStatusRequest): Promise<UpdateMatchStatusResponse> {
    return this.matchingService.updateMatchStatus(data);
  }
}
