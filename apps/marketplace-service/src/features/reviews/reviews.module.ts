import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { SupabaseModule } from '@chambitas/supabase';
import { ProjectsModule } from '../projects/projects.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [SupabaseModule, ProjectsModule, ApplicationsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
