import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Inject, OnModuleInit, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IMarketplaceService } from '@chambitas/proto';
import { CreateProjectDto, UpdateProjectDto, ListProjectsDto } from './dto/projects.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingGuard } from '../auth/guards/onboarding.guard';
import { createGrpcMetadata } from '../auth/utils/grpc-metadata.util';
import { firstValueFrom } from 'rxjs';

@ApiTags('Marketplace - Projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, OnboardingGuard)
@Controller('marketplace/projects')
export class ProjectsController implements OnModuleInit {
  private marketplaceService!: IMarketplaceService;

  constructor(@Inject('MARKETPLACE_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.marketplaceService = this.client.getService<IMarketplaceService>('MarketplaceService');
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo los empleadores pueden crear proyectos' })
  async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    const user = req.user;

    if (user.role !== 'employer') {
      throw new ForbiddenException('Solo los empleadores con perfil completado pueden publicar proyectos');
    }

    // Propagamos la identidad vía Metadata
    const metadata = createGrpcMetadata(user);

    return firstValueFrom(
      this.marketplaceService.CreateProject({
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        requirements: dto.requirements,
        service_category: dto.service_category,
        university_ids: dto.university_ids || [],
        deadline: dto.deadline || '',
        max_hours_week: dto.max_hours_week || 0,
        employer_id: user.id,
        skills: (dto.skills || []).map(s => ({
          skill_id: s.skill_id,
          min_proficiency: s.min_proficiency || 1,
          mandatory: s.mandatory ?? true,
        })),
        schedule_constraints: dto.schedule_constraints ? JSON.stringify(dto.schedule_constraints) : undefined,
      }, metadata)
    );
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Listar mis proyectos publicados (Solo Empleadores)' })
  async listMyProjects(@Req() req: any, @Query() query: ListProjectsDto) {
    const user = req.user;
    if (user.role !== 'employer') {
      throw new ForbiddenException('Solo los empleadores pueden ver sus propios proyectos');
    }

    const metadata = createGrpcMetadata(user);
    return firstValueFrom(
      this.marketplaceService.ListProjects({
        employer_id: user.id,
        status: query.status,
        service_category: query.serviceCategory,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      }, metadata)
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un proyecto específico' })
  @ApiParam({ name: 'id', description: 'ID único del proyecto (UUID)' })
  async getProject(@Param('id') id: string, @Req() req: any) {
    const metadata = createGrpcMetadata(req.user);
    return firstValueFrom(this.marketplaceService.GetProject({ id }, metadata));
  }

  @Get()
  @ApiOperation({ summary: 'Listar proyectos disponibles con filtros opcionales' })
  async listProjects(
    @Req() req: any,
    @Query() query: ListProjectsDto,
  ) {
    const metadata = createGrpcMetadata(req.user);
    return firstValueFrom(
      this.marketplaceService.ListProjects({
        employer_id: query.employerId,
        status: query.status,
        service_category: query.serviceCategory,
        university_id: query.universityId,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      }, metadata)
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la información de un proyecto' })
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Req() req: any) {
    const metadata = createGrpcMetadata(req.user);
    return firstValueFrom(
      this.marketplaceService.UpdateProject({
        id,
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        requirements: dto.requirements,
        status: dto.status,
        service_category: dto.service_category,
        university_ids: dto.university_ids,
        deadline: dto.deadline,
        max_hours_week: dto.max_hours_week,
        skills: dto.skills?.map(s => ({
          skill_id: s.skill_id,
          min_proficiency: s.min_proficiency || 1,
          mandatory: s.mandatory ?? true,
        })),
        schedule_constraints: dto.schedule_constraints ? JSON.stringify(dto.schedule_constraints) : undefined,
      }, metadata)
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un proyecto (Soft Delete)' })
  async deleteProject(@Param('id') id: string, @Req() req: any) {
    const metadata = createGrpcMetadata(req.user);
    return firstValueFrom(this.marketplaceService.DeleteProject({ id }, metadata));
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Marcar un proyecto como completado (Empleador)' })
  async completeProject(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const metadata = createGrpcMetadata(user);

    // 1. Obtener proyecto para validar dueño
    const project = await firstValueFrom(this.marketplaceService.GetProject({ id }, metadata));
    
    if (project.employer_id !== user.id) {
      throw new ForbiddenException('No tienes permiso para completar este proyecto');
    }

    return firstValueFrom(this.marketplaceService.CompleteProject({ id }, metadata));
  }
}
