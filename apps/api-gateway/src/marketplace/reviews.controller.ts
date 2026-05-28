import { Controller, Post, Patch, Delete, Get, Body, Query, Param, Inject, OnModuleInit, UseGuards, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IMarketplaceService } from '@chambitas/proto';
import { CreateReviewDto, ListReviewsDto, UpdateReviewDto } from './dto/reviews.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingGuard } from '../auth/guards/onboarding.guard';
import { createGrpcMetadata } from '../auth/utils/grpc-metadata.util';
import { firstValueFrom } from 'rxjs';

@ApiTags('Marketplace - Reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, OnboardingGuard)
@Controller('marketplace/reviews')
export class ReviewsController implements OnModuleInit {
  private marketplaceService!: IMarketplaceService;

  constructor(@Inject('MARKETPLACE_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.marketplaceService = this.client.getService<IMarketplaceService>('MarketplaceService');
  }

  @Post()
  @ApiOperation({ summary: 'Crear una reseña y calificación' })
  @ApiResponse({ status: 201, description: 'Reseña creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en la validación o proyecto no finalizado' })
  async createReview(@Body() dto: CreateReviewDto, @Req() req: any) {
    const user = req.user;
    const metadata = createGrpcMetadata(user);

    return firstValueFrom(
      this.marketplaceService.CreateReview({
        application_id: dto.application_id,
        reviewer_id: user.id,
        rating: dto.rating,
        comment: dto.comment || '',
      }, metadata)
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una reseña existente' })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({ status: 200, description: 'Reseña actualizada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para editar esta reseña' })
  @ApiResponse({ status: 404, description: 'La reseña no existe' })
  async updateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto, @Req() req: any) {
    const user = req.user;
    const metadata = createGrpcMetadata(user);

    return firstValueFrom(
      this.marketplaceService.UpdateReview({
        id,
        reviewer_id: user.id,
        rating: dto.rating,
        comment: dto.comment,
      }, metadata)
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reseña (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({ status: 200, description: 'Reseña eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar esta reseña' })
  async deleteReview(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const metadata = createGrpcMetadata(user);

    return firstValueFrom(
      this.marketplaceService.DeleteReview({
        id,
        reviewer_id: user.id,
      }, metadata)
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar reseñas con filtros' })
  async listReviews(@Query() query: ListReviewsDto, @Req() req: any) {
    const metadata = createGrpcMetadata(req.user);
    return firstValueFrom(
      this.marketplaceService.ListReviews({
        student_id: query.student_id,
        employer_id: query.employer_id,
        project_id: query.project_id,
      }, metadata)
    );
  }
}
