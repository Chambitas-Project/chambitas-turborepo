import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { StudentRepository } from './repositories/student.repository';
import { EmployerRepository } from './repositories/employer.repository';
import { SupabaseService, Database } from '@chambitas/supabase';
import { 
  CreateStudentProfileRequest, 
  UpdateStudentProfileRequest, 
  CreateEmployerProfileRequest, 
  UpdateEmployerProfileRequest,
  ProfileResponse,
  StudentProfileResponse,
  EmployerProfileResponse,
  GetProfileRequest,
  DeleteProfileRequest
} from '@chambitas/proto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly employerRepo: EmployerRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  // --- Student CRUD ---

  async createStudentProfile(data: CreateStudentProfileRequest): Promise<ProfileResponse> {
    const existing = await this.studentRepo.findByUserId(data.userId);
    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Student profile already exists and is active',
      });
    }

    try {
      await this.studentRepo.create({
        id: data.userId,
        full_name: data.fullName,
        career: data.career,
        academic_cycle: data.academicCycle,
        university_id: data.universityId,
        bio: data.bio || null,
        availability_blocks: data.availabilityBlocks ? JSON.parse(data.availabilityBlocks) : null,
        skills: data.skills || [],
      });

      const isOnboarded = await this.checkAndUpdateOnboarding(data.userId, 'student');
      return { success: true, isOnboarded };
    } catch (error: any) {
      this.logger.error(`Failed to create student profile: ${error.message}`);
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message,
      });
    }
  }

  async getStudentProfile(id: string): Promise<StudentProfileResponse> {
    const profile = await this.studentRepo.findById(id);
    if (!profile) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Student profile not found or inactive',
      });
    }

    const isOnboarded = await this.getOnboardingStatus(profile.id);

    return {
      id: profile.id,
      fullName: profile.full_name || '',
      career: profile.career || '',
      academicCycle: profile.academic_cycle || 0,
      universityId: profile.university_id,
      bio: profile.bio || '',
      availabilityBlocks: profile.availability_blocks ? JSON.stringify(profile.availability_blocks) : '{}',
      skills: profile.skills || [],
      gpa: profile.gpa || 0,
      isOnboarded,
      createdAt: profile.created_at || '',
      updatedAt: profile.updated_at || '',
    };
  }

  async updateStudentProfile(data: UpdateStudentProfileRequest): Promise<ProfileResponse> {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.career !== undefined) updateData.career = data.career;
    if (data.academicCycle !== undefined) updateData.academic_cycle = data.academicCycle;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.availabilityBlocks !== undefined) {
      updateData.availability_blocks = data.availabilityBlocks ? JSON.parse(data.availabilityBlocks) : null;
    }
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.gpa !== undefined) updateData.gpa = data.gpa;

    try {
      await this.studentRepo.update(data.userId, updateData);
      const isOnboarded = await this.checkAndUpdateOnboarding(data.userId, 'student');
      return { success: true, isOnboarded };
    } catch (error: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message,
      });
    }
  }

  // --- Employer CRUD ---

  async createEmployerProfile(data: CreateEmployerProfileRequest): Promise<ProfileResponse> {
    const existing = await this.employerRepo.findByUserId(data.userId);
    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Employer profile already exists and is active',
      });
    }

    try {
      await this.employerRepo.create({
        id: data.userId,
        company_name: data.companyName,
        ruc: data.ruc,
        sector: data.sector,
        description: data.description || null,
      });

      const isOnboarded = await this.checkAndUpdateOnboarding(data.userId, 'employer');
      return { success: true, isOnboarded };
    } catch (error: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message,
      });
    }
  }

  async getEmployerProfile(id: string): Promise<EmployerProfileResponse> {
    const profile = await this.employerRepo.findByUserId(id);
    if (!profile) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Employer profile not found or inactive',
      });
    }

    const isOnboarded = await this.getOnboardingStatus(profile.id);

    return {
      id: profile.id,
      companyName: profile.company_name || '',
      ruc: profile.ruc || '',
      sector: profile.sector || '',
      description: profile.description || '',
      verified: profile.verified || false,
      isOnboarded,
      createdAt: profile.created_at || '',
      updatedAt: profile.updated_at || '',
    };
  }

  async updateEmployerProfile(data: UpdateEmployerProfileRequest): Promise<ProfileResponse> {
    const updateData: any = {};
    if (data.companyName !== undefined) updateData.company_name = data.companyName;
    if (data.ruc !== undefined) updateData.ruc = data.ruc;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.description !== undefined) updateData.description = data.description;

    try {
      await this.employerRepo.update(data.userId, updateData);
      const isOnboarded = await this.checkAndUpdateOnboarding(data.userId, 'employer');
      return { success: true, isOnboarded };
    } catch (error: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message,
      });
    }
  }

  // --- Common ---

  async deleteProfile(userId: string): Promise<ProfileResponse> {
    try {
      await this.studentRepo.softDelete(userId);
      await this.employerRepo.softDelete(userId);
      return { success: true, isOnboarded: false };
    } catch (error: any) {
      this.logger.error(`Soft delete failed: ${error.message}`);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to deactivate profile',
      });
    }
  }

  // --- Helpers ---

  private async getOnboardingStatus(userId: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient<Database>();
    const { data } = await supabase
      .from('users')
      .select('is_onboarded')
      .eq('id', userId)
      .single();
    return !!data?.is_onboarded;
  }

  private async checkAndUpdateOnboarding(userId: string, role: 'student' | 'employer'): Promise<boolean> {
    const supabase = this.supabaseService.getClient<Database>();
    
    const { data: user } = await supabase
      .from('users')
      .select('is_onboarded')
      .eq('id', userId)
      .single();

    if (user?.is_onboarded) return true;

    let isComplete = false;
    if (role === 'student') {
      const profile = await this.studentRepo.findByUserId(userId);
      isComplete = !!(profile?.full_name && profile?.career && profile?.university_id);
    } else {
      const profile = await this.employerRepo.findByUserId(userId);
      isComplete = !!(profile?.company_name && profile?.ruc && profile?.sector);
    }

    if (isComplete) {
      await supabase
        .from('users')
        .update({ is_onboarded: true })
        .eq('id', userId);
    }

    return isComplete;
  }
}
