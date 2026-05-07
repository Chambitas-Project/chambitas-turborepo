import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  CreateApplicationRequest, 
  Application, 
  GetApplicationRequest, 
  ListStudentApplicationsRequest, 
  ListProjectApplicationsRequest, 
  ListApplicationsResponse, 
  UpdateApplicationStatusRequest 
} from '@chambitas/proto';
import { ApplicationsRepository } from './applications.repository';
import { ProjectsRepository } from '../projects/projects.repository';
import { Tables } from '@chambitas/supabase';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async createApplication(request: CreateApplicationRequest): Promise<Application> {
    this.logger.log(`Creating application for student ${request.studentId} on project ${request.projectId}`);

    // 1. Validar que el proyecto exista y esté abierto
    const project = await this.projectsRepository.findById(request.projectId);
    if (!project) {
      throw new NotFoundException(`El proyecto ${request.projectId} no existe.`);
    }
    if (project.status !== 'open') {
      throw new BadRequestException(`El proyecto no está abierto para nuevas postulaciones (Status: ${project.status}).`);
    }

    // 2. Validar que el estudiante no tenga una postulación activa para este proyecto
    const existing = await this.applicationsRepository.findActiveByStudentAndProject(request.studentId, request.projectId);
    if (existing) {
      throw new BadRequestException('Ya tienes una postulación activa para este proyecto.');
    }

    const application = await this.applicationsRepository.create({
      project_id: request.projectId,
      student_id: request.studentId,
      cover_note: request.coverNote,
      match_id: request.matchId || null,
    });

    return this.mapToProto(application);
  }

  async getApplication(request: GetApplicationRequest): Promise<Application> {
    const application = await this.applicationsRepository.findById(request.id);
    if (!application) {
      throw new NotFoundException(`Postulación ${request.id} no encontrada.`);
    }
    return this.mapToProto(application);
  }

  async listStudentApplications(request: ListStudentApplicationsRequest): Promise<ListApplicationsResponse> {
    const { data, total } = await this.applicationsRepository.findAll({
      student_id: request.studentId,
      limit: request.limit,
      offset: request.offset,
    });

    return {
      applications: data.map(a => this.mapToProto(a)),
      total,
    };
  }

  async listProjectApplications(request: ListProjectApplicationsRequest): Promise<ListApplicationsResponse> {
    const { data, total } = await this.applicationsRepository.findAll({
      project_id: request.projectId,
      limit: request.limit,
      offset: request.offset,
    });

    return {
      applications: data.map(a => this.mapToProto(a)),
      total,
    };
  }

  async updateApplicationStatus(request: UpdateApplicationStatusRequest): Promise<Application> {
    const application = await this.applicationsRepository.updateStatus(request.id, request.status as any);
    return this.mapToProto(application);
  }

  private mapToProto(app: Tables<'applications'>): Application {
    return {
      id: app.id,
      projectId: app.project_id,
      studentId: app.student_id,
      status: app.status || 'pending',
      coverNote: app.cover_note || '',
      matchId: app.match_id || undefined,
      appliedAt: app.applied_at || '',
      createdAt: app.created_at || '',
      updatedAt: app.updated_at || '',
      deletedAt: app.deleted_at || '',
    };
  }
}
