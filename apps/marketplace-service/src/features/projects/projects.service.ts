import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { ProjectsRepository } from './projects.repository';
import { Tables, SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient<Database>();
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    this.logger.log(`Creating project: ${request.title} for employer: ${request.employerId}`);
    
    // 1. Validación de existencia del empleador
    const { data: employer, error } = await this.supabase
      .from('employer_profiles')
      .select('id')
      .eq('id', request.employerId)
      .single();

    if (error || !employer) {
      throw new NotFoundException(`El empleador con ID ${request.employerId} no existe.`);
    }

    // 2. Formateo de requisitos para ML
    const formattedRequirements = (request.requirements || [])
      .map(r => r.trim())
      .filter(r => r.length > 0)
      .map(r => r.toLowerCase());

    const project = await this.projectsRepository.create({
      title: request.title,
      description: request.description,
      employer_id: request.employerId,
      budget: request.budget,
      requirements: formattedRequirements,
      service_category: request.serviceCategory,
      deadline: request.deadline,
      max_hours_week: request.maxHoursWeek,
    }, request.universityIds);

    return this.mapToProto(project);
  }

  async getProject(request: GetProjectRequest): Promise<Project> {
    const project = await this.projectsRepository.findById(request.id);
    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${request.id} no encontrado.`);
    }
    return this.mapToProto(project);
  }

  async listProjects(request: ListProjectsRequest): Promise<ListProjectsResponse> {
    const { data, total } = await this.projectsRepository.findAll({
      employer_id: request.employerId,
      status: request.status as any,
      service_category: request.serviceCategory,
      university_id: request.universityId,
      limit: request.limit,
      offset: request.offset,
    });

    return {
      projects: data.map(p => this.mapToProto(p)),
      total,
    };
  }

  async updateProject(request: UpdateProjectRequest): Promise<Project> {
    const existing = await this.projectsRepository.findById(request.id);
    if (!existing) {
      throw new NotFoundException(`Proyecto ${request.id} no encontrado.`);
    }

    const project = await this.projectsRepository.update(request.id, {
      title: request.title ?? undefined,
      description: request.description ?? undefined,
      budget: request.budget ?? undefined,
      requirements: request.requirements && request.requirements.length > 0 
        ? request.requirements.map(r => r.trim()).filter(r => r.length > 0).map(r => r.toLowerCase()) 
        : undefined,
      status: (request.status as any) ?? undefined,
      service_category: request.serviceCategory ?? undefined,
      deadline: request.deadline ?? undefined,
      max_hours_week: request.maxHoursWeek ?? undefined,
    }, request.universityIds);

    return this.mapToProto(project);
  }

  async deleteProject(request: DeleteProjectRequest): Promise<DeleteProjectResponse> {
    await this.projectsRepository.softDelete(request.id);
    return {
      success: true,
      message: 'Proyecto eliminado correctamente.',
    };
  }

  private mapToProto(project: Tables<'projects'> & { university_ids: string[] }): Project {
    return {
      id: project.id,
      title: project.title,
      description: project.description || '',
      employerId: project.employer_id,
      budget: project.budget || 0,
      requirements: project.requirements || [],
      status: project.status || 'open',
      serviceCategory: project.service_category,
      universityIds: project.university_ids || [],
      deadline: project.deadline || '',
      maxHoursWeek: project.max_hours_week || 0,
      createdAt: project.created_at || '',
      updatedAt: project.updated_at || '',
      deletedAt: project.deleted_at || '',
    };
  }
}


