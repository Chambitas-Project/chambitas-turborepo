import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PROTO_PATH } from '@chambitas/proto';
import { SupabaseModule } from '@chambitas/supabase';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    SupabaseModule, 
    forwardRef(() => ApplicationsModule),
    ClientsModule.register([
      {
        name: 'ML_ENGINE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'ml_engine',
          protoPath: PROTO_PATH.ML_ENGINE,
          url: process.env.ML_ENGINE_GRPC_URL || 'localhost:50058',
          loader: {
            keepCase: true,
          }
        },
      },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule { }
