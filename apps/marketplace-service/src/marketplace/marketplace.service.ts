import { Injectable, Logger } from '@nestjs/common';
import { CreateJobRequest, CreateJobResponse, GetJobsRequest, GetJobsResponse } from '@chambitas/proto';
import { of, Observable } from 'rxjs';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  createJob(data: CreateJobRequest): Observable<CreateJobResponse> {
    this.logger.log(`Creating job: ${data.title}`);
    // Implementación real con DB aquí
    return of({ jobId: 'new-job-id', success: true });
  }

  getJobs(data: GetJobsRequest): Observable<GetJobsResponse> {
    this.logger.log(`Getting jobs for category: ${data.category}`);
    // Implementación real con DB aquí
    return of({ jobs: [], total: 0 });
  }
}
