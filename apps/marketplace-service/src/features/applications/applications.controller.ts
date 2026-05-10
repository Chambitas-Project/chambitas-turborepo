import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApplicationsService } from './applications.service';
import { 
  CreateApplicationRequest, 
  GetApplicationRequest, 
  ListStudentApplicationsRequest, 
  ListProjectApplicationsRequest, 
  UpdateApplicationStatusRequest,
  Application,
  ListApplicationsResponse
} from '@chambitas/proto';

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @GrpcMethod('MarketplaceService', 'CreateApplication')
  async createApplication(request: CreateApplicationRequest): Promise<Application> {
    return this.applicationsService.createApplication(request);
  }

  @GrpcMethod('MarketplaceService', 'GetApplication')
  async getApplication(request: GetApplicationRequest): Promise<Application> {
    return this.applicationsService.getApplication(request);
  }

  @GrpcMethod('MarketplaceService', 'ListStudentApplications')
  async listStudentApplications(request: ListStudentApplicationsRequest): Promise<ListApplicationsResponse> {
    return this.applicationsService.listStudentApplications(request);
  }

  @GrpcMethod('MarketplaceService', 'ListProjectApplications')
  async listProjectApplications(request: ListProjectApplicationsRequest): Promise<ListApplicationsResponse> {
    return this.applicationsService.listProjectApplications(request);
  }

  @GrpcMethod('MarketplaceService', 'UpdateApplicationStatus')
  async updateApplicationStatus(request: UpdateApplicationStatusRequest): Promise<Application> {
    return this.applicationsService.updateApplicationStatus(request);
  }

  @GrpcMethod('MarketplaceService', 'DeleteApplication')
  async deleteApplication(request: any): Promise<any> {
    return this.applicationsService.deleteApplication(request);
  }
}
