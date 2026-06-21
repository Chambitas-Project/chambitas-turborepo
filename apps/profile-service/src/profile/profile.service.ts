import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { SupabaseService } from '@chambitas/supabase';
import {
  CompleteOnboardingRequest,
  ProfileResponse,
  UnifiedProfileResponse,
  ListCareersRequest,
  ListCareersResponse,
  Career,
  IMLEngineService
} from '@chambitas/proto';
import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { StudentRepository } from './repositories/student.repository';
import { EmployerRepository } from './repositories/employer.repository';
import { CareersRepository } from './repositories/careers.repository';
import { Database } from '@chambitas/supabase';

@Injectable()
export class ProfileService implements OnModuleInit {
  private readonly logger = new Logger(ProfileService.name);
  private mlEngine!: IMLEngineService;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly studentRepo: StudentRepository,
    private readonly employerRepo: EmployerRepository,
    private readonly careersRepo: CareersRepository,
    @Inject('ML_ENGINE_PACKAGE') private readonly mlClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.mlEngine = this.mlClient.getService<IMLEngineService>('MLEngineService');
  }

  async listCareers(request: ListCareersRequest): Promise<ListCareersResponse> {
    this.logger.log(`Listing careers with filters: ${JSON.stringify(request)}`);
    const careers = await this.careersRepo.findAll({
      university_id: request.university_id,
      area: request.area,
    });

    return {
      careers: careers.map(c => ({
        id: c.id,
        name: c.name,
        area: c.area || '',
        is_active: c.is_active || false,
      })),
    };
  }

  // --- Legacy Compatibility Methods (CamelCase) ---
  async createStudentProfile(data: any) { return this.completeOnboarding({ ...data, role: 'student', user_id: data.userId }); }
  async getStudentProfile(id: string) { return this.getProfile(id); }
  async updateStudentProfile(data: any) { return this.updateProfileInternal(data, 'student'); }
  async createEmployerProfile(data: any) { return this.completeOnboarding({ ...data, role: 'employer', user_id: data.userId }); }
  async getEmployerProfile(id: string) { return this.getProfile(id); }
  async updateEmployerProfile(data: any) { return this.updateProfileInternal(data, 'employer'); }
  async deleteProfile(userId: string) { return this.deleteProfileInternal(userId); }
  async searchProfiles(query: string, role?: string, limit?: number, offset?: number) { return this.searchProfilesInternal(query, role, limit, offset); }

  async getProfile(id: string): Promise<UnifiedProfileResponse> {
    this.logger.log(`[GetProfile] Fetching profile for user ${id}`);

    // Buscar primero si es un estudiante
    const student = await this.studentRepo.findByUserId(id);
    if (student) {
      this.logger.debug(`[GetProfile] Student data found: ${JSON.stringify(student)}`);
      return this.mapStudentToUnified(student);
    }

    // Si no, buscar si es un empleador
    const employer = await this.employerRepo.findByUserId(id);
    if (employer) {
      this.logger.debug(`[GetProfile] Employer data found: ${JSON.stringify(employer)}`);
      return this.mapEmployerToUnified(employer);
    }

    // Verificar si es administrador
    const supabase = this.supabaseService.getClient<Database>();
    const { data: user } = await supabase.from('users').select('*').eq('id', id).single();
    if (user && user.role === 'admin') {
      this.logger.debug(`[GetProfile] Admin user found: ${id}`);
      return {
        id: user.id,
        role: 'admin',
        full_name: 'Administrador General',
        is_onboarded: true,
        is_gpa_verified: false,
        skills: [],
        activity: [],
      };
    }

    this.logger.error(`[GetProfile] Profile not found for user ${id}`);
    throw new RpcException({ code: status.NOT_FOUND, message: 'Profile not found' });
  }

  async completeOnboarding(data: CompleteOnboardingRequest): Promise<ProfileResponse> {
    const supabase = this.supabaseService.getClient<Database>();
    this.logger.log(`Starting onboarding for user ${data.user_id} with role ${data.role}`);

    try {
      if (data.role === 'student') {
        // 1. Validar ciclo académico
        if (data.academic_cycle !== undefined && (data.academic_cycle < 1 || data.academic_cycle > 12)) {
          throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'El ciclo académico debe estar entre 1 y 12' });
        }

        // 2. Validar campos obligatorios
        if (!data.full_name) {
          throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'El nombre completo es requerido' });
        }
        if (!data.career_id) {
          throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'La carrera es requerida' });
        }

        // 3. Validar skills (3-10)
        if (!data.skill_inputs || data.skill_inputs.length < 3 || data.skill_inputs.length > 10) {
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'Debes seleccionar entre 3 y 10 habilidades para completar el onboarding'
          });
        }

        // 4. Resolver university_id desde la base de datos (ya no viene en el payload)
        const { data: userData } = await supabase
          .from('users')
          .select('university_id')
          .eq('id', data.user_id)
          .single();
        const universityId = userData?.university_id ?? undefined;

        if (!universityId) {
          throw new RpcException({
            code: status.FAILED_PRECONDITION,
            message: 'No se encontró university_id para el estudiante'
          });
        }

        // 5. Resolver SkillInputs (nombres → UUIDs), preservando proficiency_level por skill
        const resolvedSkills = await this.resolveSkillInputs(data.skill_inputs as any[]);
        const resolvedSkillIds = resolvedSkills.map(s => s.id);
        const resolvedProficiencyLevels = resolvedSkills.map(s => s.proficiency_level);

        // 6. Operación ATÓMICA vía Supabase RPC (PL/pgSQL con BEGIN/COMMIT)
        //    Incluye: upsert student_profiles + skills[], delete+insert student_skills, update users.is_onboarded
        const { error: rpcError } = await supabase.rpc('complete_student_onboarding' as any, {
          p_user_id: data.user_id,
          p_full_name: data.full_name,
          p_university_id: universityId,
          p_career_id: data.career_id,
          p_academic_cycle: data.academic_cycle || 1,
          p_skill_ids: resolvedSkillIds,
          p_proficiency_levels: resolvedProficiencyLevels,
          p_bio: data.bio ?? null,
        });

        if (rpcError) {
          this.logger.error(`[Onboarding] RPC complete_student_onboarding failed: ${rpcError.message}`);
          throw new RpcException({
            code: status.INTERNAL,
            message: `Error en la transacción de onboarding: ${rpcError.message}`,
          });
        }

        // 6.5 Actualización manual de campos nuevos (Workaround para RPC antiguo)
        this.logger.log(`[Onboarding] Syncing student profile for ${data.user_id}`);
        const { error: updateError } = await supabase
          .from('student_profiles')
          .update({
            full_name: data.full_name,
            university_id: universityId,
            career_id: data.career_id,
            academic_cycle: data.academic_cycle || 1,
            bio: data.bio || null,
            gpa: data.gpa || null,
            is_gpa_verified: false,
            evidence_url: data.evidence_url || null,
            availability_blocks: data.availability_blocks
              ? (typeof data.availability_blocks === 'string' ? JSON.parse(data.availability_blocks) : data.availability_blocks)
              : null,
          } as any)
          .eq('id', data.user_id);

        if (updateError) {
          this.logger.error(`[Onboarding] Student profile update failed: ${updateError.message}`);
        } else {
          this.logger.log(`[Onboarding] Student profile updated successfully`);
        }

        // 7. Sincronizar estado de onboarding (Centralizado)
        await this.checkAndUpdateOnboarding(data.user_id, 'student');
        this.logger.log(`[Onboarding] Student onboarding state synced`);

        firstValueFrom(this.mlEngine.GenerateStudentEmbedding({ student_id: data.user_id }))
          .then(() => this.logger.log(`[Webhook] Vectorización disparada para estudiante ${data.user_id}`))
          .catch(e => this.logger.error(`[Webhook] Fallo al alertar al ML Engine: ${e.message}`));

      } else if (data.role === 'employer') {
        // 1. Validar campos mandatorios
        if (!data.company_name || !data.name || !data.description) {
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'company_name, name y description son obligatorios para empleadores'
          });
        }

        // 2. Upsert del perfil de empleador
        const employerUpdate: any = { id: data.user_id };
        if (data.company_name !== undefined) employerUpdate.company_name = data.company_name;
        if (data.name !== undefined) employerUpdate.name = data.name;
        if (data.description !== undefined) employerUpdate.description = data.description;

        const { error: employerError } = await supabase.from('employer_profiles').upsert(employerUpdate);
        if (employerError) throw employerError;

        // 3. Marcar onboarding completo en public.users
        const isOnboarded = await this.checkAndUpdateOnboarding(data.user_id, 'employer');
        if (!isOnboarded) {
          throw new RpcException({
            code: status.FAILED_PRECONDITION,
            message: 'El perfil fue actualizado pero los requisitos de onboarding no están completos.'
          });
        }

      } else {
        throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Rol inválido para onboarding' });
      }

      return { success: true, is_onboarded: true, message: 'Onboarding completado exitosamente' };

    } catch (error: any) {
      this.logger.error(`Error in completeOnboarding: ${error.message}`, error.stack);
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: status.INTERNAL, message: `Onboarding fallido: ${error.message}` });
    }
  }

  async updateProfile(data: CompleteOnboardingRequest): Promise<ProfileResponse> {
    return this.updateProfileInternal(data, data.role as 'student' | 'employer');
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

  /**
   * Resuelve SkillInput[] (nombres o UUIDs + proficiency_level) a { id, proficiency_level }[]
   * preservando el nivel de dominio definido por el usuario para cada skill.
   *
   * POLÍTICA: Skills que no existen en el catálogo → INVALID_ARGUMENT (no se crean implícitamente).
   */
  private async resolveSkillInputs(
    skillInputs: Array<{ name: string; proficiency_level?: number }>
  ): Promise<Array<{ id: string; proficiency_level: number }>> {
    const supabase = this.supabaseService.getClient<Database>();
    const result: Array<{ id: string; proficiency_level: number }> = [];
    const namesToResolve: Array<{ name: string; proficiency_level: number }> = [];
    const uuidItems: Array<{ name: string; proficiency_level: number }> = [];

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    for (const item of skillInputs) {
      const level = Math.min(Math.max(item.proficiency_level ?? 1, 1), 5); // clamp 1-5
      if (uuidRegex.test(item.name)) {
        uuidItems.push({ name: item.name, proficiency_level: level });
      } else {
        namesToResolve.push({ name: item.name, proficiency_level: level });
      }
    }

    // Items que ya son UUIDs → agregar directamente
    for (const item of uuidItems) {
      result.push({ id: item.name, proficiency_level: item.proficiency_level });
    }

    // Items por nombre → resolver contra la DB
    if (namesToResolve.length > 0) {
      const names = namesToResolve.map(i => i.name);
      this.logger.log(`Resolving skill names: ${names.join(', ')}`);

      const { data: existingSkills, error: selectError } = await supabase
        .from('skills')
        .select('id, name')
        .in('name', names);

      if (selectError) {
        throw new RpcException({ code: status.INTERNAL, message: `Error al buscar habilidades: ${selectError.message}` });
      }

      const skillsFound = existingSkills || [];
      const foundMap = new Map(skillsFound.map(s => [s.name.toLowerCase(), s.id]));

      const notFoundNames = namesToResolve.filter(i => !foundMap.has(i.name.toLowerCase()));
      if (notFoundNames.length > 0) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Las siguientes habilidades no existen en el catálogo: ${notFoundNames.map(i => i.name).join(', ')}. Usa GET /profile/skills para ver las opciones disponibles.`,
        });
      }

      for (const item of namesToResolve) {
        const id = foundMap.get(item.name.toLowerCase())!;
        result.push({ id, proficiency_level: item.proficiency_level });
      }
    }

    return result;
  }


  // --- Helpers ---

  private async checkAndUpdateOnboarding(userId: string, role: 'student' | 'employer'): Promise<boolean> {
    const supabase = this.supabaseService.getClient<Database>();

    // 1. Verificación de reglas de negocio por rol
    let isComplete = false;
    if (role === 'student') {
      const { data: profile } = await supabase.from('student_profiles').select('*').eq('id', userId).single();
      const { count } = await supabase.from('student_skills').select('*', { count: 'exact', head: true }).eq('student_id', userId);

      isComplete = !!(
        profile?.full_name &&
        profile?.career_id &&
        profile?.university_id &&
        profile?.academic_cycle &&
        count !== null && count >= 3
      );
    } else {
      const { data: profile } = await supabase.from('employer_profiles').select('*').eq('id', userId).single();
      isComplete = !!(
        profile?.company_name &&
        profile?.name &&
        profile?.description
      );
    }

    // 2. Si está completo, sincronizar con Identity (users y auth.users)
    if (isComplete) {
      this.logger.log(`[IdentitySync] User ${userId} completed onboarding. Syncing...`);
      
      // Tabla pública
      await supabase.from('users').update({ is_onboarded: true }).eq('id', userId);

      // Metadatos de Auth (Admin)
      try {
        const adminClient = this.supabaseService.getAdminClient<Database>();
        await adminClient.auth.admin.updateUserById(userId, {
          user_metadata: { is_onboarded: true },
        });
      } catch (authError: any) {
        this.logger.error(`[IdentitySync] Error updating auth metadata: ${authError?.message}`);
      }
    }

    return isComplete;
  }

  private async updateProfileInternal(data: any, role: 'student' | 'employer'): Promise<ProfileResponse> {
    const supabase = this.supabaseService.getClient<Database>();
    const userId = data.user_id || data.userId;
    this.logger.log(`[UpdateProfile] Updating profile for user ${userId} with role ${role}`);

    try {
      if (role === 'student') {
        const updateData: any = {};
        if (data.full_name) updateData.full_name = data.full_name;
        if (data.career_id) updateData.career_id = data.career_id;
        if (data.academic_cycle !== undefined) updateData.academic_cycle = data.academic_cycle;
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.gpa !== undefined) updateData.gpa = data.gpa;
        if (data.is_gpa_verified !== undefined) updateData.is_gpa_verified = data.is_gpa_verified;
        if (data.evidence_url !== undefined) updateData.evidence_url = data.evidence_url;
        if (data.availability_blocks) {
          try {
            updateData.availability_blocks = typeof data.availability_blocks === 'string'
              ? JSON.parse(data.availability_blocks)
              : data.availability_blocks;
          } catch (e) {
            this.logger.warn(`Failed to parse availability_blocks, sending as is: ${data.availability_blocks}`);
            updateData.availability_blocks = data.availability_blocks;
          }
        }

        let resolvedSkills: any[] | null = null;
        if (data.skill_inputs && Array.isArray(data.skill_inputs)) {
          this.logger.log(`[UpdateProfile] Resolving skills for student ${userId}`);
          resolvedSkills = await this.resolveSkillInputs(data.skill_inputs);
          updateData.skills = resolvedSkills.map((s: any) => s.id);
        }

        const { error } = await supabase
          .from('student_profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) throw new RpcException({ code: status.INTERNAL, message: error.message });

        // Update skills if provided
        if (resolvedSkills) {
          // Delete existing skills
          const { error: deleteError } = await supabase
            .from('student_skills')
            .delete()
            .eq('student_id', userId);
          
          if (deleteError) {
            this.logger.error(`[UpdateProfile] Error deleting skills: ${deleteError.message}`);
          } else if (resolvedSkills.length > 0) {
            // Insert new skills
            const { error: insertError } = await supabase
              .from('student_skills')
              .insert(resolvedSkills.map(s => ({
                student_id: userId,
                skill_id: s.id,
                proficiency_level: s.proficiency_level
              })));
            
            if (insertError) {
              this.logger.error(`[UpdateProfile] Error inserting skills: ${insertError.message}`);
              throw new RpcException({ code: status.INTERNAL, message: `Error al guardar habilidades: ${insertError.message}` });
            }
          }
        }
        
        firstValueFrom(this.mlEngine.GenerateStudentEmbedding({ student_id: userId }))
          .then(() => this.logger.log(`[Webhook] Re-vectorización disparada para estudiante ${userId}`))
          .catch(e => this.logger.error(`[Webhook] Fallo al alertar al ML Engine: ${e.message}`));
          
      } else {
        const updateData: any = {};
        if (data.company_name) updateData.company_name = data.company_name;
        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;

        const { error } = await supabase
          .from('employer_profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) throw new RpcException({ code: status.INTERNAL, message: error.message });
      }

      return { success: true, is_onboarded: true, message: 'Perfil actualizado con éxito' };
    } catch (error: any) {
      this.logger.error(`[UpdateProfile] Error updating profile: ${error.message}`);
      throw error instanceof RpcException ? error : new RpcException({
        code: status.INTERNAL,
        message: error.message
      });
    }
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
      career: student.career?.name || student.career_id, // Map career name for display
      university_id: student.university_id,
      university_name: student.university?.name,
      university_logo: student.university?.logo_url,
      academic_cycle: student.academic_cycle,
      bio: student.bio,
      gpa: student.gpa,
      is_gpa_verified: student.is_gpa_verified || false,
      evidence_url: student.evidence_url,
      availability_blocks: student.availability_blocks ? JSON.stringify(student.availability_blocks) : undefined,
      is_onboarded: student.user?.is_onboarded || false,
      skills: (student.student_skills || []).map((ss: any) => ({
        id: ss.skill?.id,
        name: ss.skill?.name,
        proficiency_level: ss.proficiency_level || 1,
        verified: ss.verified || false,
      })),
      activity: [], // Por implementar
    };
  }

  private mapEmployerToUnified(employer: any): UnifiedProfileResponse {
    return {
      id: employer.id,
      role: 'employer',
      full_name: employer.name || employer.company_name, // Prioritize brand name for display
      company_name: employer.company_name,
      commercial_name: employer.name,
      bio: employer.description,
      is_onboarded: employer.user?.is_onboarded || false,
      is_gpa_verified: false,
      skills: [],
      activity: [],
    };
  }
}
