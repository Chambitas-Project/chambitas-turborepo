import { Module } from '@nestjs/common';
import { ApplicationsRepository } from './applications.repository';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsRepository, ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
