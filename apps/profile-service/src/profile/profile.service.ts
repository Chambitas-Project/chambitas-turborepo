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
    // Validaciones Estrictas
    if (data.academicCycle < 1 || data.academicCycle > 12) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Academic cycle must be between 1 and 12' });
    }

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
        university_id: data.university_id,
        bio: data.bio || null,
        availability_blocks: data.availabilityBlocks ? JSON.parse(data.availabilityBlocks) : null,
      });

      // Si se enviaron skills iniciales (IDs)
      if (data.skills && data.skills.length > 0) {
        const supabase = this.supabaseService.getClient<Database>();
        await supabase.from('student_skills').upsert(
          data.skills.map(skillId => ({
            student_id: data.userId,
            skill_id: skillId,
            proficiency_level: 1 // Nivel inicial
          }))
        );
      }

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
      university_id: profile.university_id,
      bio: profile.bio || '',
      availabilityBlocks: profile.availability_blocks ? JSON.stringify(profile.availability_blocks) : '{}',
      skills: [], // Enriquecido en getProfile unificado
      gpa: profile.gpa || 0,
      isOnboarded,
      createdAt: profile.created_at || '',
      updatedAt: profile.updated_at || '',
    };
  }

  async updateStudentProfile(data: UpdateStudentProfileRequest): Promise<ProfileResponse> {
    // Validaciones Estrictas
    if (data.academicCycle !== undefined && (data.academicCycle < 1 || data.academicCycle > 12)) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Academic cycle must be between 1 and 12' });
    }
    if (data.gpa !== undefined && (data.gpa < 0 || data.gpa > 20)) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'GPA must be between 0 and 20' });
    }

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.career !== undefined) updateData.career = data.career;
    if (data.academicCycle !== undefined) updateData.academic_cycle = data.academicCycle;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.availabilityBlocks !== undefined) {
      updateData.availability_blocks = data.availabilityBlocks ? JSON.parse(data.availabilityBlocks) : null;
    }
    if (data.gpa !== undefined) updateData.gpa = data.gpa;

    try {
      const supabase = this.supabaseService.getClient<Database>();

      // 1. Actualizar perfil base
      if (Object.keys(updateData).length > 0) {
        await this.studentRepo.update(data.userId, updateData);
      }

      // 2. Gestión masiva de Skills
      if (data.skillUpdates && data.skillUpdates.length > 0) {
        for (const update of data.skillUpdates) {
          if (update.deleted) {
            await supabase.from('student_skills')
              .delete()
              .match({ student_id: data.userId, skill_id: update.skillId });
          } else {
            await supabase.from('student_skills').upsert({
              student_id: data.userId,
              skill_id: update.skillId,
              proficiency_level: update.proficiencyLevel
            });
          }
        }
      }

      const isOnboarded = await this.checkAndUpdateOnboarding(data.userId, 'student');
      return { success: true, isOnboarded };
    } catch (error: any) {
      this.logger.error(`Failed to update student profile: ${error.message}`);
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

  async getProfile(id: string): Promise<any> {
    const supabase = this.supabaseService.getClient<Database>();

    // 1. Obtener la base del usuario para determinar el rol
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, is_onboarded, university_id')
      .eq('id', id)
      .single();

    if (userError || !user) {
      throw new RpcException({ code: status.NOT_FOUND, message: 'User not found' });
    }

    if (user.role === 'student') {
      // 2a. Aggregator para Estudiantes
      const { data: student, error: studentError } = await supabase
        .from('student_profiles')
        .select(`
          *,
          universities (id, name, logo_url, slug),
          student_skills (
            proficiency_level,
            verified,
            skills (id, name)
          ),
          applications (
            id,
            status,
            created_at,
            projects (id, title)
          )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (studentError || !student) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'Student profile not found' });
      }

      return {
        id: user.id,
        role: user.role,
        fullName: student.full_name || '',
        career: student.career || '',
        universityId: student.universities?.id,
        universityName: student.universities?.name,
        universityLogo: student.universities?.logo_url,
        bio: student.bio || '',
        academicCycle: student.academic_cycle || 0,
        gpa: student.gpa || 0,
        isOnboarded: user.is_onboarded || false,
        skills: (student.student_skills as any[] || []).map(ss => ({
          id: ss.skills?.id,
          name: ss.skills?.name,
          proficiencyLevel: ss.proficiency_level,
          verified: ss.verified
        })),
        activity: (student.applications as any[] || []).map(app => ({
          id: app.id,
          title: app.projects?.title,
          status: app.status,
          type: 0, // APPLICATION
          date: app.created_at
        }))
      };
    } else {
      // 2b. Aggregator para Empleadores
      const { data: employer, error: employerError } = await supabase
        .from('employer_profiles')
        .select(`
          *,
          projects (
            id,
            title,
            status,
            created_at
          )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (employerError || !employer) {
        throw new RpcException({ code: status.NOT_FOUND, message: 'Employer profile not found' });
      }

      return {
        id: user.id,
        role: user.role,
        fullName: employer.company_name || '',
        sector: employer.sector || '',
        bio: employer.description || '',
        isOnboarded: user.is_onboarded || false,
        skills: [],
        activity: (employer.projects as any[] || []).map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          type: 1, // PROJECT
          date: p.created_at
        }))
      };
    }
  }

  async searchProfiles(query: string, role?: string, limit = 10, offset = 0) {
    const supabase = this.supabaseService.getClient<Database>();
    const profiles: any[] = [];

    if (!role || role === 'student') {
      const { data: students } = await supabase
        .from('student_profiles')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .is('deleted_at', null)
        .range(offset, offset + limit - 1);
      
      if (students) {
        profiles.push(...students.map(s => ({
          id: s.id,
          role: 'student',
          fullName: s.full_name,
          career: s.career,
          universityId: s.university_id,
        })));
      }
    }

    if (!role || role === 'employer') {
      const { data: employers } = await supabase
        .from('employer_profiles')
        .select('*')
        .ilike('company_name', `%${query}%`)
        .is('deleted_at', null)
        .range(offset, offset + limit - 1);

      if (employers) {
        profiles.push(...employers.map(e => ({
          id: e.id,
          role: 'employer',
          fullName: e.company_name,
          sector: e.sector,
        })));
      }
    }

    return { profiles };
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
