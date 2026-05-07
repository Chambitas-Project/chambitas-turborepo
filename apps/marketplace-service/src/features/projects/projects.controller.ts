import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { 
  CreateProjectRequest, 
  Project, 
  GetProjectRequest, 
  ListProjectsRequest, 
  ListProjectsResponse, 
  UpdateProjectRequest, 
  DeleteProjectRequest, 
  DeleteProjectResponse
} from '@chambitas/proto';
import { ProjectsService } from './projects.service';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @GrpcMethod('MarketplaceService', 'CreateProject')
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return this.projectsService.createProject(data);
  }

  @GrpcMethod('MarketplaceService', 'GetProject')
  async getProject(data: GetProjectRequest): Promise<Project> {
    return this.projectsService.getProject(data);
  }

  @GrpcMethod('MarketplaceService', 'ListProjects')
  async listProjects(data: ListProjectsRequest): Promise<ListProjectsResponse> {
    return this.projectsService.listProjects(data);
  }

  @GrpcMethod('MarketplaceService', 'UpdateProject')
  async updateProject(data: UpdateProjectRequest): Promise<Project> {
    return this.projectsService.updateProject(data);
  }

  @GrpcMethod('MarketplaceService', 'DeleteProject')
  async deleteProject(data: DeleteProjectRequest): Promise<DeleteProjectResponse> {
    return this.projectsService.deleteProject(data);
  }
}
