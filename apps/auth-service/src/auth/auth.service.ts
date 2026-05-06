import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(data: any) {
    const supabase = this.supabaseService.getClient<Database>();
    
    // 1. Crear usuario en Supabase Auth
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
          university_id: data.universityId, // from gRPC university_id
        });

      if (userError) throw new Error(userError.message);

      // 3. Crear registro inicial en perfiles
      if (data.role === 'student') {
        const { error: profileError } = await supabase
          .from('student_profiles')
          .insert({
            id: userId,
            university_id: data.universityId,
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
