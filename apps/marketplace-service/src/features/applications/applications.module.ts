import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApplicationsRepository } from './applications.repository';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    forwardRef(() => ProjectsModule),
    BullModule.registerQueue({ name: 'ml-scoring-queue' })
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsRepository, ApplicationsService],
  exports: [ApplicationsService, ApplicationsRepository],
})
export class ApplicationsModule { }
