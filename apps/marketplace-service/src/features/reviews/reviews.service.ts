import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { 
  CreateReviewRequest, 
  Review, 
  ListReviewsRequest, 
  ListReviewsResponse,
  UpdateReviewRequest,
  DeleteReviewRequest
} from '@chambitas/proto';
import { ReviewsRepository } from './reviews.repository';
import { ApplicationsRepository } from '../applications/applications.repository';
import { ProjectsRepository } from '../projects/projects.repository';
import { Tables } from '@chambitas/supabase';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async createReview(request: CreateReviewRequest): Promise<Review> {
    this.logger.log(`Creating review for application ${request.application_id} by user ${request.reviewer_id}`);

    // 1. Validar aplicación
    const application = await this.applicationsRepository.findById(request.application_id);
    if (!application) {
      throw new RpcException({ code: status.NOT_FOUND, message: 'La postulación no existe' });
    }

    // 2. Validar que el proyecto esté cerrado
    const project = await this.projectsRepository.findById(application.project_id);
    if (!project) {
      throw new RpcException({ code: status.NOT_FOUND, message: 'El proyecto asociado no existe' });
    }
    
    // Solo permitir reseñas si el proyecto está cerrado o la postulación está completada
    if (project.status !== 'closed' && application.status !== 'completed') {
      throw new RpcException({ code: status.FAILED_PRECONDITION, message: 'Solo se pueden dejar reseñas en proyectos finalizados' });
    }

    // 3. Determinar rol del revisor y validar pertenencia
    let reviewerRole: 'student' | 'employer';
    
    if (request.reviewer_id === application.student_id) {
      reviewerRole = 'student';
    } else if (request.reviewer_id === project.employer_id) {
      reviewerRole = 'employer';
    } else {
      throw new RpcException({ code: status.PERMISSION_DENIED, message: 'No tienes permiso para calificar este micro-trabajo' });
    }

    // 4. Evitar duplicados (un revisor solo puede calificar una vez por aplicación)
    const existingReviews = await this.reviewsRepository.findByApplicationId(request.application_id);
    const alreadyReviewed = existingReviews.some(r => r.reviewer_id === request.reviewer_id);
    if (alreadyReviewed) {
      throw new RpcException({ code: status.ALREADY_EXISTS, message: 'Ya has calificado este micro-trabajo' });
    }

    // 5. Crear reseña
    const review = await this.reviewsRepository.create({
      application_id: request.application_id,
      reviewer_id: request.reviewer_id,
      reviewer_role: reviewerRole,
      rating: request.rating,
      comment: request.comment,
    });

    return this.mapToProto(review);
  }

  async listReviews(request: ListReviewsRequest): Promise<ListReviewsResponse> {
    this.logger.log(`Listing reviews for filters: ${JSON.stringify(request)}`);
    
    const reviewsData = await this.reviewsRepository.findByTargetId({
      student_id: request.student_id,
      employer_id: request.employer_id,
      project_id: request.project_id,
    });

    const reviews = reviewsData.map(r => this.mapToProto(r));
    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
      : 0;

    return {
      reviews,
      average_rating: parseFloat(averageRating.toFixed(1)),
    };
  }

  async updateReview(request: UpdateReviewRequest): Promise<Review> {
    this.logger.log(`Updating review ${request.id} by user ${request.reviewer_id}`);

    // 1. Verificar existencia y autoría
    const review = await this.reviewsRepository.findById(request.id);
    if (!review) {
      throw new RpcException({ code: status.NOT_FOUND, message: 'La reseña no existe' });
    }

    if (review.reviewer_id !== request.reviewer_id) {
      throw new RpcException({ code: status.PERMISSION_DENIED, message: 'No tienes permiso para editar esta reseña' });
    }

    // 2. Actualizar
    const updatedReview = await this.reviewsRepository.update(request.id, {
      rating: request.rating,
      comment: request.comment,
    });

    return this.mapToProto(updatedReview);
  }

  async deleteReview(request: DeleteReviewRequest): Promise<Review> {
    this.logger.log(`Deleting review ${request.id} by user ${request.reviewer_id}`);

    // 1. Verificar existencia y autoría
    const review = await this.reviewsRepository.findById(request.id);
    if (!review) {
      throw new RpcException({ code: status.NOT_FOUND, message: 'La reseña no existe' });
    }

    if (review.reviewer_id !== request.reviewer_id) {
      throw new RpcException({ code: status.PERMISSION_DENIED, message: 'No tienes permiso para eliminar esta reseña' });
    }

    // 2. Eliminar (Soft Delete)
    const deletedReview = await this.reviewsRepository.softDelete(request.id);

    return this.mapToProto(deletedReview);
  }

  private mapToProto(review: any): Review {
    return {
      id: review.id,
      application_id: review.application_id,
      reviewer_id: review.reviewer_id,
      reviewer_role: review.reviewer_role,
      rating: review.rating,
      comment: review.comment || '',
      created_at: review.created_at || '',
      reviewer_name: review.reviewer?.student_profiles?.full_name || 
                     review.reviewer?.employer_profiles?.name || 
                     review.reviewer?.employer_profiles?.company_name || 
                     '',
    };
  }
}
