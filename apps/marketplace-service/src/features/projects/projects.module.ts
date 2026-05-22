import { Module, forwardRef } from '@nestjs/common';
import { SupabaseModule } from '@chambitas/supabase';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [SupabaseModule, forwardRef(() => ApplicationsModule)],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule { }
