import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { StudentRepository } from './repositories/student.repository';
import { EmployerRepository } from './repositories/employer.repository';
import { SupabaseModule } from '@chambitas/supabase';

@Module({
  imports: [SupabaseModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    StudentRepository,
    EmployerRepository,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
