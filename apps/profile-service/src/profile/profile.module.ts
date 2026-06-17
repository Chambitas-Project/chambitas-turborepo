import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PROTO_PATH } from '@chambitas/proto';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { StudentRepository } from './repositories/student.repository';
import { EmployerRepository } from './repositories/employer.repository';
import { CareersRepository } from './repositories/careers.repository';
import { SupabaseModule } from '@chambitas/supabase';

@Module({
  imports: [
    SupabaseModule,
    ClientsModule.register([
      {
        name: 'ML_ENGINE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'ml_engine',
          protoPath: PROTO_PATH.ML_ENGINE,
          url: process.env.ML_ENGINE_GRPC_URL || 'localhost:50058',
        },
      },
    ]),
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    StudentRepository,
    EmployerRepository,
    CareersRepository,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
