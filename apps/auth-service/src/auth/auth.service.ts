import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SupabaseService, Database } from '@chambitas/supabase';
import { UNIVERSITY_EMAIL_PATTERNS } from '@chambitas/common';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(data: any) {
    const supabase = this.supabaseService.getClient<Database>();

    // 1. Strict Security Check
    if (data.role === 'student') {
      if (!data.university_id) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'University ID is required for student registration',
        });
      }

      // Fetch university for validation
      const { data: university, error: uniError } = await supabase
        .from('universities')
        .select('email_domain, slug')
        .eq('id', data.university_id)
        .single();

      if (uniError || !university) {
        throw new RpcException({
          code: 3,
          message: 'Invalid university ID',
        });
      }

      const [localPart, domain] = data.email.split('@');
      let isValid = true;

      // Validate Domain
      if (domain !== university.email_domain) {
        isValid = false;
      }

      // Validate Regex
      if (isValid && university.slug) {
        const pattern = UNIVERSITY_EMAIL_PATTERNS[university.slug];
        if (pattern && !pattern.test(localPart)) {
          isValid = false;
        }
      }

      if (!isValid) {
        // Audit failure
        await supabase.from('security_audit_logs').insert({
          event_type: 'regex_fail',
          severity: 'warning',
          university_id: data.university_id,
          metadata: { email: data.email, reason: 'University email validation failed' },
          created_at: new Date().toISOString(),
        });

        throw new RpcException({
          code: 3,
          message: 'Email is invalid for the selected university or does not match requirements',
        });
      }
    }
    
    // 2. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: authError.message,
      });
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'No se pudo obtener el ID del usuario al registrar',
      });
    }

    try {
      // 2. Insertar en public.users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: data.email,
          role: data.role,
          university_id: data.university_id, // from gRPC university_id
        });

      if (userError) throw new Error(userError.message);

      // 3. Crear registro inicial en perfiles
      if (data.role === 'student') {
        const { error: profileError } = await supabase
          .from('student_profiles')
          .insert({
            id: userId,
            university_id: data.university_id,
          });
        if (profileError) throw new Error(profileError.message);
      } else if (data.role === 'employer') {
        const { error: profileError } = await supabase
          .from('employer_profiles')
          .insert({
            id: userId,
          });
        if (profileError) throw new Error(profileError.message);
      }

      return {
        userId,
        email: data.email,
      };
    } catch (err: any) {
      // Rollback: Borrar usuario de Supabase Auth
      await supabase.auth.admin.deleteUser(userId);
      throw new RpcException({
        code: 13, // INTERNAL
        message: `Fallo al registrar usuario en la base de datos: ${err.message}`,
      });
    }
  }

  async login(data: any) {
    const supabase = this.supabaseService.getClient<Database>();
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: authError.message,
      });
    }

    const userId = authData.user?.id;
    
    // Obtener role y is_onboarded de public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, is_onboarded')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'No se pudo obtener la información del usuario',
      });
    }

    return {
      userId,
      email: data.email,
      role: userData.role,
      accessToken: authData.session?.access_token,
      isOnboarded: userData.is_onboarded || false,
    };
  }

  async updateOnboarding(data: any) {
    const supabase = this.supabaseService.getClient<Database>();

    if (data.role === 'student') {
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.career !== undefined) updateData.career = data.career;
      if (data.academicCycle !== undefined) updateData.academic_cycle = data.academicCycle;

      const { error } = await supabase
        .from('student_profiles')
        .update(updateData)
        .eq('id', data.userId);

      if (error) {
        throw new RpcException({ code: 13, message: error.message });
      }
    } else if (data.role === 'employer') {
      const updateData: any = {};
      if (data.companyName !== undefined) updateData.company_name = data.companyName;
      if (data.sector !== undefined) updateData.sector = data.sector;

      const { error } = await supabase
        .from('employer_profiles')
        .update(updateData)
        .eq('id', data.userId);

      if (error) {
        throw new RpcException({ code: 13, message: error.message });
      }
    }

    return { success: true };
  }
}
