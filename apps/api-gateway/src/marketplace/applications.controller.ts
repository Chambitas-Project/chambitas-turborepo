import { Controller, Post, Get, Patch, Body, Param, Query, Inject, OnModuleInit, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IMarketplaceService } from '@chambitas/proto';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/applications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@ApiTags('Marketplace - Applications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('marketplace/applications')
export class ApplicationsController implements OnModuleInit {
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
        projectId: dto.project_id,
        studentId: user.id,
        coverNote: dto.cover_note,
        matchId: dto.match_id,
      })
    );
  }

  @Get('student')
  @ApiOperation({ summary: 'Listar postulaciones del estudiante actual' })
  async listMyApplications(@Req() req: any) {
    return firstValueFrom(
      this.marketplaceService.ListStudentApplications({
        studentId: req.user.id,
      })
    );
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Listar postulaciones de un proyecto (Empleador)' })
  async listProjectApplications(@Param('projectId') projectId: string) {
    return firstValueFrom(
      this.marketplaceService.ListProjectApplications({
        projectId,
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
    
    // 1. Obtener la postulación para ver a qué proyecto pertenece
    const application = await firstValueFrom(this.marketplaceService.GetApplication({ id }));
    
    // 2. Obtener el proyecto para ver quién es el dueño
    const project = await firstValueFrom(this.marketplaceService.GetProject({ id: application.projectId }));
    
    // 3. Validar que el usuario sea el dueño del proyecto
    if (project.employerId !== user.id) {
      throw new ForbiddenException('No tienes permiso para gestionar las postulaciones de este proyecto');
    }

    return firstValueFrom(
      this.marketplaceService.UpdateApplicationStatus({
        id,
        status: dto.status,
      })
    );
  }
}
