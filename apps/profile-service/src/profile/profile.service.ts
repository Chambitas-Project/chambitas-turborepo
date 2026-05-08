import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { SupabaseService } from '@chambitas/supabase';
import { 
  CompleteOnboardingRequest, 
  ProfileResponse, 
  UnifiedProfileResponse 
} from '@chambitas/proto';
import { StudentRepository } from './repositories/student.repository';
import { EmployerRepository } from './repositories/employer.repository';
import { Database } from '@chambitas/supabase';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly studentRepo: StudentRepository,
    private readonly employerRepo: EmployerRepository,
  ) {}

  // --- Legacy Compatibility Methods (CamelCase) ---
  async createStudentProfile(data: any) { return this.completeOnboarding({ ...data, role: 'student', user_id: data.userId }); }
  async getStudentProfile(id: string) { return this.getProfile(id); }
  async updateStudentProfile(data: any) { return this.completeOnboarding({ ...data, role: 'student', user_id: data.userId }); }
  async createEmployerProfile(data: any) { return this.completeOnboarding({ ...data, role: 'employer', user_id: data.userId }); }
  async getEmployerProfile(id: string) { return this.getProfile(id); }
  async updateEmployerProfile(data: any) { return this.completeOnboarding({ ...data, role: 'employer', user_id: data.userId }); }
  async deleteProfile(userId: string) { return this.deleteProfileInternal(userId); }
  async searchProfiles(query: string, role?: string, limit?: number, offset?: number) { return this.searchProfilesInternal(query, role, limit, offset); }

  async getProfile(id: string): Promise<UnifiedProfileResponse> {
    // Buscar primero si es un estudiante
    const student = await this.studentRepo.findByUserId(id);
    if (student) {
      return this.mapStudentToUnified(student);
    }

    // Si no, buscar si es un empleador
    const employer = await this.employerRepo.findByUserId(id);
    if (employer) {
      return this.mapEmployerToUnified(employer);
    }

    throw new RpcException({ code: status.NOT_FOUND, message: 'Profile not found' });
  }

  async completeOnboarding(data: CompleteOnboardingRequest): Promise<ProfileResponse> {
    const supabase = this.supabaseService.getClient<Database>();
    this.logger.log(`Starting onboarding for user ${data.user_id} with role ${data.role}`);

    try {
      if (data.role === 'student') {
        // 1. Validar ciclo académico
        if (data.academic_cycle !== undefined && (data.academic_cycle < 1 || data.academic_cycle > 12)) {
          throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Academic cycle must be between 1 and 12' });
        }

        // 2. Validar skills (3-10)
        if (!data.skills || data.skills.length < 3 || data.skills.length > 10) {
          throw new RpcException({ 
            code: status.INVALID_ARGUMENT, 
            message: 'Students must select between 3 and 10 skills to complete onboarding' 
          });
        }

        // 3. Resolver university_id si no viene en el payload
        let universityId = data.university_id;
        if (!universityId) {
          const { data: userData } = await supabase.from('users').select('university_id').eq('id', data.user_id).single();
          universityId = userData?.university_id || '';
        }

        // 4. Operación Atómica - Perfil (Evitar sobreescribir con nulls si los campos son opcionales)
        const profileUpdate: any = { id: data.user_id, university_id: universityId };
        if (data.full_name !== undefined) profileUpdate.full_name = data.full_name;
        if (data.career !== undefined) profileUpdate.career = data.career;
        if (data.academic_cycle !== undefined) profileUpdate.academic_cycle = data.academic_cycle;

        const { error: profileError } = await supabase.from('student_profiles').upsert(profileUpdate);

        if (profileError) throw profileError;

        // 5. Resolver Skill IDs (nombres a UUIDs)
        const resolvedSkillIds = await this.resolveSkillIds(data.skills as string[]);

        // 6. Operación Atómica - Skills
        const { error: deleteError } = await supabase.from('student_skills').delete().eq('student_id', data.user_id);
        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase.from('student_skills').insert(
          resolvedSkillIds.map((skillId: string) => ({
            student_id: data.user_id,
            skill_id: skillId,
            proficiency_level: 1
          }))
        );
        if (insertError) throw insertError;

      } else if (data.role === 'employer') {
        // 1. Validar campos mandatorios (Solo si es la primera vez o si se envían)
        // Pero para onboarding, usualmente requerimos todo.
        if (!data.company_name || !data.ruc || !data.sector || !data.description) {
          throw new RpcException({ 
            code: status.INVALID_ARGUMENT, 
            message: 'Company name, RUC, sector and description are mandatory for employers' 
          });
        }

        // 2. Upsert Profile (Evitar sobreescribir con nulls)
        const employerUpdate: any = { id: data.user_id };
        if (data.company_name !== undefined) employerUpdate.company_name = data.company_name;
        if (data.ruc !== undefined) employerUpdate.ruc = data.ruc;
        if (data.sector !== undefined) employerUpdate.sector = data.sector;
        if (data.description !== undefined) employerUpdate.description = data.description;

        const { error: employerError } = await supabase.from('employer_profiles').upsert(employerUpdate);

        if (employerError) throw employerError;
      } else {
        throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Invalid role for onboarding' });
      }

      // 5. Verificar y Activar Estado Onboarded
      const isOnboarded = await this.checkAndUpdateOnboarding(data.user_id, data.role as any);
      
      if (!isOnboarded) {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'Profile update successful but onboarding requirements not fully met.'
        });
      }

      return { success: true, is_onboarded: true, message: 'Onboarding completed successfully' };

    } catch (error: any) {
      this.logger.error(`Error in completeOnboarding: ${error.message}`, error.stack);
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: status.INTERNAL, message: `Onboarding failed: ${error.message}` });
    }
  }

  async listSkills(category?: string): Promise<{ skills: any[] }> {
    const supabase = this.supabaseService.getClient<Database>();
    let query = supabase.from('skills').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw new RpcException({ code: status.INTERNAL, message: error.message });
    return { skills: data || [] };
  }

  private async resolveSkillIds(skillNamesOrIds: string[]): Promise<string[]> {
    const supabase = this.supabaseService.getClient<Database>();
    const resolvedIds: string[] = [];
    const namesToResolve: string[] = [];

    // Separar UUIDs de nombres
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    skillNamesOrIds.forEach(item => {
      if (uuidRegex.test(item)) {
        resolvedIds.push(item);
      } else {
        namesToResolve.push(item);
      }
    });

    if (namesToResolve.length > 0) {
      this.logger.log(`Resolving ${namesToResolve.length} skill names: ${namesToResolve.join(', ')}`);
      
      // Buscar habilidades existentes por nombre
      const { data: existingSkills, error: selectError } = await supabase
        .from('skills')
        .select('id, name')
        .in('name', namesToResolve);

      if (selectError) {
        this.logger.error(`Error searching skills: ${selectError.message}`);
        throw new RpcException({ code: status.INTERNAL, message: `Error resolving skills: ${selectError.message}` });
      }

      const skillsFound = existingSkills || [];
      skillsFound.forEach(s => resolvedIds.push(s.id));
      
      // Habilidades que no existen y deben ser creadas
      const existingNames = skillsFound.map(s => s.name.toLowerCase());
      const missingNames = namesToResolve.filter(n => !existingNames.includes(n.toLowerCase()));

      if (missingNames.length > 0) {
        this.logger.log(`Creating ${missingNames.length} new skills: ${missingNames.join(', ')}`);
        const { data: newSkills, error: insertError } = await supabase
          .from('skills')
          .insert(missingNames.map(name => ({ name })))
          .select('id');

        if (insertError) {
          this.logger.error(`Error creating skills: ${insertError.message}`);
          throw new RpcException({ code: status.INTERNAL, message: `Error creating skills: ${insertError.message}` });
        }

        if (newSkills) {
          newSkills.forEach(s => resolvedIds.push(s.id));
        }
      }
    }

    return resolvedIds;
  }

  // --- Helpers ---

  private async checkAndUpdateOnboarding(userId: string, role: 'student' | 'employer'): Promise<boolean> {
    const supabase = this.supabaseService.getClient<Database>();
    
    // Verificación final del estado
    let isComplete = false;
    if (role === 'student') {
      const { data: profile } = await supabase.from('student_profiles').select('*').eq('id', userId).single();
      const { count } = await supabase.from('student_skills').select('*', { count: 'exact', head: true }).eq('student_id', userId);

      isComplete = !!(
        profile?.full_name && 
        profile?.career && 
        profile?.university_id && 
        profile?.academic_cycle &&
        count !== null && count >= 3
      );
    } else {
      const { data: profile } = await supabase.from('employer_profiles').select('*').eq('id', userId).single();
      isComplete = !!(
        profile?.company_name && 
        profile?.ruc && 
        profile?.sector && 
        profile?.description
      );
    }

    if (isComplete) {
      await supabase.from('users').update({ is_onboarded: true }).eq('id', userId);
    }

    return isComplete;
  }

  private async deleteProfileInternal(user_id: string): Promise<ProfileResponse> {
    const supabase = this.supabaseService.getClient<Database>();
    const { error } = await supabase.from('users').delete().eq('id', user_id); // Cambiado a delete real o desactivar
    if (error) throw new RpcException({ code: status.INTERNAL, message: error.message });
    return { success: true, is_onboarded: false, message: 'Profile deleted' };
  }

  private async searchProfilesInternal(query: string, role?: string, limit = 10, offset = 0) {
    const supabase = this.supabaseService.getClient<Database>();
    // ... simplificado para recuperación rápida ...
    return { profiles: [] }; 
  }

  private mapStudentToUnified(student: any): UnifiedProfileResponse {
    return {
      id: student.id,
      role: 'student',
      full_name: student.full_name,
      career: student.career,
      university_id: student.university_id,
      academic_cycle: student.academic_cycle,
      is_onboarded: student.is_onboarded || false,
      skills: student.skills || [],
      activity: [], // Por implementar
    };
  }

  private mapEmployerToUnified(employer: any): UnifiedProfileResponse {
    return {
      id: employer.id,
      role: 'employer',
      full_name: employer.company_name, // Mapping company name as full name for display
      sector: employer.sector,
      is_onboarded: employer.is_onboarded || false,
      skills: [],
      activity: [],
    };
  }
}
