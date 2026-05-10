import { Controller, Post, Get, Patch, Body, Param, Query, Inject, OnModuleInit, UseGuards, Req, ForbiddenException, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IMarketplaceService } from '@chambitas/proto';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/applications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingGuard } from '../auth/guards/onboarding.guard';
import { firstValueFrom } from 'rxjs';

@ApiTags('Marketplace - Applications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, OnboardingGuard)
@Controller('marketplace/applications')
export class ApplicationsController implements OnModuleInit {
  private readonly logger = new Logger(ApplicationsController.name);
  private marketplaceService!: IMarketplaceService;

  constructor(@Inject('MARKETPLACE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.marketplaceService = this.client.getService<IMarketplaceService>('MarketplaceService');
  }

  @Post()
  @ApiOperation({ summary: 'Postular a un proyecto (Estudiantes)' })
  @ApiResponse({ status: 201, description: 'Postulación enviada' })
  async createApplication(@Body() dto: CreateApplicationDto, @Req() req: any) {
    const user = req.user;
    
    if (user.role !== 'student') {
      throw new ForbiddenException('Solo los estudiantes pueden postular a proyectos');
    }

    return firstValueFrom(
      this.marketplaceService.CreateApplication({
        project_id: dto.project_id,
        student_id: user.id,
        cover_note: dto.cover_note,
      })
    );
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'Listar mis postulaciones enviadas (Solo Estudiantes)' })
  async listMyApplications(@Req() req: any) {
    const user = req.user;
    if (user.role !== 'student') {
      throw new ForbiddenException('Solo los estudiantes pueden ver sus postulaciones');
    }
    return firstValueFrom(
      this.marketplaceService.ListStudentApplications({
        student_id: user.id,
      })
    );
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Listar postulaciones de un proyecto (Empleador)' })
  async listProjectApplications(@Param('projectId') projectId: string) {
    return firstValueFrom(
      this.marketplaceService.ListProjectApplications({
        project_id: projectId,
      })
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado de una postulación (Empleador)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: any
  ) {
    const user = req.user;
    
    try {
      this.logger.debug(`Attempting to update application ${id} to status ${dto.status}`);
      
      // 1. Obtener la postulación para ver a qué proyecto pertenece
      const application = await firstValueFrom(this.marketplaceService.GetApplication({ id }));
      
      // 2. Obtener el proyecto para ver quién es el dueño
      const project = await firstValueFrom(this.marketplaceService.GetProject({ id: application.project_id }));
      
      // 3. Validar que el usuario sea el dueño del proyecto
      if (project.employer_id !== user.id) {
        throw new ForbiddenException('No tienes permiso para gestionar las postulaciones de este proyecto');
      }

      return await firstValueFrom(
        this.marketplaceService.UpdateApplicationStatus({
          id,
          status: dto.status,
        })
      );
    } catch (error: any) {
      this.logger.error(`Error updating application status: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una postulación (Estudiante)' })
  async cancelApplication(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    
    // 1. Obtener la postulación para ver de quién es
    const application = await firstValueFrom(this.marketplaceService.GetApplication({ id }));
    
    // 2. Validar que sea el dueño de la postulación
    if (application.student_id !== user.id) {
      throw new ForbiddenException('No puedes cancelar una postulación que no te pertenece');
    }

    return firstValueFrom(
      this.marketplaceService.DeleteApplication({ id })
    );
  }
}
