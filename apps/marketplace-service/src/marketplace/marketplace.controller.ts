import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MarketplaceService } from './marketplace.service';
import { CreateJobRequest, CreateJobResponse, GetJobsRequest, GetJobsResponse } from '@chambitas/proto';
import { Observable } from 'rxjs';

@Controller()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @GrpcMethod('MarketplaceService', 'CreateJob')
  createJob(data: CreateJobRequest): Observable<CreateJobResponse> {
    return this.marketplaceService.createJob(data);
  }

  @GrpcMethod('MarketplaceService', 'GetJobs')
  getJobs(data: GetJobsRequest): Observable<GetJobsResponse> {
    return this.marketplaceService.getJobs(data);
  }
}
