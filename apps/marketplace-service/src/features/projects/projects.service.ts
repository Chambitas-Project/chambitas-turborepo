import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
import { ProjectsRepository } from './projects.repository';
import { ApplicationsRepository } from '../applications/applications.repository';
import { Tables, SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  private get supabase() {
    return this.supabaseService.getClient<Database>();
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    this.logger.log(`Creating project: ${request.title} for employer: ${request.employer_id}`);
    
    // 1. Validación de existencia y rol en la tabla users
    const { data: user, error } = await this.supabase
      .from('users')
      .select('id, role')
      .eq('id', request.employer_id)
      .single();

    if (error || !user) {
      throw new NotFoundException(`El usuario con ID ${request.employer_id} no existe.`);
    }

    if (user.role !== 'employer') {
      throw new ForbiddenException('Solo los usuarios con rol "employer" pueden publicar proyectos');
    }

    // 2. Formateo de requisitos para ML
    const formattedRequirements = (request.requirements || [])
      .map(r => r.trim())
      .filter(r => r.length > 0)
      .map(r => r.toLowerCase());

    const project = await this.projectsRepository.create({
      title: request.title,
      description: request.description,
      employer_id: request.employer_id,
      budget: request.budget,
      requirements: formattedRequirements,
      service_category: request.service_category,
      deadline: request.deadline,
      max_hours_week: request.max_hours_week,
      schedule_constraints: request.schedule_constraints ? JSON.parse(request.schedule_constraints) : undefined,
    }, request.university_ids, request.skills);

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
      employer_id: request.employer_id,
      status: request.status as any,
      service_category: request.service_category,
      university_id: request.university_id,
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
      service_category: request.service_category ?? undefined,
      deadline: request.deadline ?? undefined,
      max_hours_week: request.max_hours_week ?? undefined,
      schedule_constraints: request.schedule_constraints ? JSON.parse(request.schedule_constraints) : undefined,
    }, request.university_ids, request.skills);

    return this.mapToProto(project);
  }

  async deleteProject(request: DeleteProjectRequest): Promise<DeleteProjectResponse> {
    await this.projectsRepository.softDelete(request.id);
    return {
      success: true,
      message: 'Proyecto eliminado correctamente.',
    };
  }

  async completeProject(request: CompleteProjectRequest): Promise<CompleteProjectResponse> {
    this.logger.log(`Completing project ${request.id}`);

    // 1. Verificar que el proyecto exista y esté en progreso
    const project = await this.projectsRepository.findById(request.id);
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    if (project.status !== 'in_progress') {
      throw new BadRequestException('Solo se pueden completar proyectos que están "en progreso"');
    }

    // 2. Marcar proyecto como cerrado
    await this.projectsRepository.updateStatus(request.id, 'closed');

    // 3. Marcar la aplicación aceptada como completada
    const { data: apps } = await this.applicationsRepository.findAll({ project_id: request.id, status: 'accepted' });
    for (const app of apps) {
      await this.applicationsRepository.updateStatus(app.id, 'completed');
    }

    return {
      success: true,
      message: 'Proyecto y postulaciones marcados como completados exitosamente',
    };
  }

  private mapToProto(project: Tables<'projects'> & { university_ids: string[]; skills: any[] }): Project {
    return {
      id: project.id,
      title: project.title,
      description: project.description || '',
      employer_id: project.employer_id,
      budget: project.budget || 0,
      requirements: project.requirements || [],
      status: project.status || 'open',
      service_category: project.service_category,
      university_ids: project.university_ids || [],
      deadline: project.deadline || '',
      max_hours_week: project.max_hours_week || 0,
      skills: project.skills || [],
      schedule_constraints: project.schedule_constraints ? JSON.stringify(project.schedule_constraints) : '',
      created_at: project.created_at || '',
      updated_at: project.updated_at || '',
      deleted_at: project.deleted_at || '',
    };
  }
}


