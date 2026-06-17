import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { 
  CreateReviewRequest, 
  Review, 
  ListReviewsRequest, 
  ListReviewsResponse,
  UpdateReviewRequest,
  DeleteReviewRequest
} from '@chambitas/proto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @GrpcMethod('MarketplaceService', 'CreateReview')
  async createReview(request: CreateReviewRequest): Promise<Review> {
    return this.reviewsService.createReview(request);
  }

  @GrpcMethod('MarketplaceService', 'ListReviews')
  async listReviews(request: ListReviewsRequest): Promise<ListReviewsResponse> {
    return this.reviewsService.listReviews(request);
  }

  @GrpcMethod('MarketplaceService', 'UpdateReview')
  async updateReview(request: UpdateReviewRequest): Promise<Review> {
    return this.reviewsService.updateReview(request);
  }

  @GrpcMethod('MarketplaceService', 'DeleteReview')
  async deleteReview(request: DeleteReviewRequest): Promise<Review> {
    return this.reviewsService.deleteReview(request);
  }
}
