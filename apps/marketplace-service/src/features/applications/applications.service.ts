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
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly projectsRepository: ProjectsRepository,
    @InjectQueue('ml-scoring-queue') private scoringQueue: Queue,
  ) { }

  async createApplication(request: CreateApplicationRequest): Promise<Application> {
    this.logger.log(`Creating application for student ${request.student_id} on project ${request.project_id}`);

    const project = await this.projectsRepository.findById(request.project_id);
    if (!project) {
      throw new NotFoundException(`El proyecto ${request.project_id} no existe.`);
    }
    if (project.status !== 'open') {
      throw new BadRequestException(`El proyecto no está abierto para nuevas postulaciones (Status: ${project.status}).`);
    }

    const existing = await this.applicationsRepository.findActiveByStudentAndProject(request.student_id, request.project_id);
    if (existing) {
      throw new BadRequestException('Ya tienes una postulación activa para este proyecto.');
    }

    const studentData = await this.applicationsRepository.getStudentValidationData(request.student_id);
    if (!studentData) {
      throw new BadRequestException('No se pudo encontrar el perfil del estudiante.');
    }

    const application = await this.applicationsRepository.create({
      project_id: request.project_id,
      student_id: request.student_id,
      cover_note: request.cover_note,
      match_id: request.match_id || null,
      status: 'pending_scoring' as any,
    });

    try {
      await this.scoringQueue.add('calculate-score', {
        application_id: application.id,
        project_id: application.project_id,
        student_id: application.student_id,
      });
    } catch (error) {
      this.logger.error(`Failed to queue calculate-score job for application ${application.id}. Redis might be down: ${error}`);
    }

    return this.mapToProto(application);
  }

  async getApplication(request: GetApplicationRequest): Promise<Application> {
    this.logger.debug(`Fetching application: ${request.id}`);
    const application = await this.applicationsRepository.findById(request.id);
    if (!application) {
      this.logger.warn(`Application not found: ${request.id}`);
      throw new NotFoundException(`Postulación ${request.id} no encontrada.`);
    }
    return this.mapToProto(application);
  }

  async listStudentApplications(request: ListStudentApplicationsRequest): Promise<ListApplicationsResponse> {
    const { data, total } = await this.applicationsRepository.findAll({
      student_id: request.student_id,
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
      project_id: request.project_id,
      limit: request.limit,
      offset: request.offset,
    });

    return {
      applications: data.map(a => this.mapToProto(a)),
      total,
    };
  }

  async updateApplicationStatus(request: UpdateApplicationStatusRequest): Promise<Application> {
    this.logger.log(`Updating status for app ${request.id} to ${request.status}`);
    const status = request.status as any;

    // 1. Actualizar el estado de la postulación
    const application = await this.applicationsRepository.updateStatus(request.id, status);

    // 2. Si se acepta la postulación, cambiar el estado del proyecto a 'in_progress'
    if (status === 'accepted') {
      this.logger.log(`Application accepted, moving project ${application.project_id} to in_progress`);
      await this.projectsRepository.updateStatus(application.project_id, 'in_progress');
    }

    return this.mapToProto(application);
  }

  async deleteApplication(request: any): Promise<{ success: boolean; message: string }> {
    await this.applicationsRepository.softDelete(request.id);
    return {
      success: true,
      message: 'Postulación eliminada correctamente.',
    };
  }

  private mapToProto(app: any): Application {
    return {
      id: app.id,
      project_id: app.project_id,
      student_id: app.student_id,
      status: app.status || 'pending',
      cover_note: app.cover_note || '',
      match_id: app.match_id || undefined,
      applied_at: app.applied_at || '',
      created_at: app.created_at || '',
      updated_at: app.updated_at || '',
      deleted_at: app.deleted_at || '',
      student_name: app.student_profiles?.full_name || undefined,
      student_career: app.student_profiles?.careers?.name || undefined,
      student_academic_cycle: app.student_profiles?.academic_cycle || undefined,
      match_score: (Array.isArray(app.matches) ? app.matches[0]?.score : app.matches?.score) || undefined,
      project_title: app.projects?.title || undefined,
      student_skills: app.student_profiles?.student_skills?.map((ss: any) => ({
        id: ss.skills?.id,
        name: ss.skills?.name,
        proficiency_level: ss.proficiency_level,
        verified: ss.verified || false,
      })) || [],
      student_phone: app.status === 'accepted' ? app.student_profiles?.phone_number || undefined : undefined,
      student_email: app.status === 'accepted' ? app.student_profiles?.users?.email || undefined : undefined,
    };
  }
}
