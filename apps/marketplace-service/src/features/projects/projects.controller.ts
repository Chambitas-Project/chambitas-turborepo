import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { 
  CreateProjectRequest, 
  Project, 
  GetProjectRequest, 
  ListProjectsRequest, 
  ListProjectsResponse, 
  UpdateProjectRequest, 
  DeleteProjectRequest, 
  DeleteProjectResponse,
  CompleteProjectRequest,
  CompleteProjectResponse
} from '@chambitas/proto';
import { ProjectsService } from './projects.service';
import { CurrentUser, IUserContext } from '@chambitas/common';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @GrpcMethod('MarketplaceService', 'CreateProject')
  async createProject(
    @Payload() data: CreateProjectRequest, 
    @CurrentUser() user: IUserContext
  ): Promise<Project> {
    // Podemos asegurar que el employer_id sea el del usuario autenticado
    // si el microservicio desea delegar la identidad al body o usar el contexto.
    console.log(`[Marketplace] Creating project for user: ${user.id} with role: ${user.role}`);
    
    // Inyectamos el ID del usuario autenticado para garantizar seguridad
    const projectData = { ...data, employer_id: user.id };
    return this.projectsService.createProject(projectData);
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

  @GrpcMethod('MarketplaceService', 'CompleteProject')
  async completeProject(data: CompleteProjectRequest): Promise<CompleteProjectResponse> {
    return this.projectsService.completeProject(data);
  }
}
