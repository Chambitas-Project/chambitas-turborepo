import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Inject, OnModuleInit, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IMarketplaceService } from '@chambitas/proto';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@ApiTags('Marketplace - Projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('marketplace/projects')
export class ProjectsController implements OnModuleInit {
  private marketplaceService!: IMarketplaceService;

  constructor(@Inject('MARKETPLACE_PACKAGE') private client: ClientGrpc) {}

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
      throw new ForbiddenException('Solo los empleadores pueden publicar proyectos');
    }

    return firstValueFrom(
      this.marketplaceService.CreateProject({
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        requirements: dto.requirements,
        service_category: dto.service_category,
        university_ids: dto.university_ids,
        deadline: dto.deadline,
        max_hours_week: dto.max_hours_week,
        employer_id: user.id,
      })
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un proyecto específico' })
  @ApiParam({ name: 'id', description: 'ID único del proyecto (UUID)' })
  async getProject(@Param('id') id: string) {
    return firstValueFrom(this.marketplaceService.GetProject({ id }));
  }

  @Get()
  @ApiOperation({ summary: 'Listar proyectos disponibles con filtros opcionales' })
  async listProjects(
    @Query('employerId') employerId?: string,
    @Query('status') status?: string,
    @Query('serviceCategory') serviceCategory?: string,
    @Query('universityId') universityId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return firstValueFrom(
      this.marketplaceService.ListProjects({
        employer_id: employerId,
        status,
        service_category: serviceCategory,
        university_id: universityId,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      })
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la información de un proyecto' })
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
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
      })
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un proyecto (Soft Delete)' })
  async deleteProject(@Param('id') id: string) {
    return firstValueFrom(this.marketplaceService.DeleteProject({ id }));
  }
}
