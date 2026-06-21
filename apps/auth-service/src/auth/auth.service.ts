import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { RpcException, ClientGrpc } from '@nestjs/microservices';
import { SupabaseService, Database } from '@chambitas/supabase';
import { UNIVERSITY_EMAIL_PATTERNS } from '@chambitas/common';
import { IAnalyticsService } from '@chambitas/proto';

@Injectable()
export class AuthService implements OnModuleInit {
  private analyticsService!: IAnalyticsService;

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject('ANALYTICS_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.analyticsService = this.client.getService<IAnalyticsService>('AnalyticsService');
  }

  async register(data: any) {
    const supabase = this.supabaseService.getClient<Database>();

    // 1. Pre-validation for Students (Institutional Domain/Regex)
    if (data.role === 'student') {
      const universityId = data.university_id || data.universityId;

      console.log('[AuthService] Validating student registration:', {
        email: data.email,
        university_id: universityId,
      });

      if (!universityId) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: 'University ID is required for student registration',
        });
      }

      // Fetch university for validation
      const { data: university, error: uniError } = await supabase
        .from('universities')
        .select('email_domain, slug')
        .eq('id', universityId)
        .single();

      if (uniError || !university) {
        console.error('[AuthService] University not found:', universityId);
        throw new RpcException({
          code: 3,
          message: 'Invalid university ID',
        });
      }

      const cleanEmail = data.email?.trim();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new RpcException({
          code: 3,
          message: 'Invalid email format',
        });
      }

      const [localPart, domain] = cleanEmail.split('@');
      let isValid = true;

      // Validate Domain (Case-Insensitive)
      if (domain.toLowerCase() !== university.email_domain.toLowerCase()) {
        console.warn(`[AuthService] Domain mismatch: Expected ${university.email_domain}, Got ${domain}`);
        isValid = false;
      }

      // Validate Regex (Case-Insensitive slug lookup)
      if (isValid && university.slug) {
        const slugKey = university.slug.toUpperCase();
        const pattern = UNIVERSITY_EMAIL_PATTERNS[slugKey];
        if (pattern) {
          console.log(`[AuthService] Testing regex for ${slugKey}:`, pattern.toString());
          if (!pattern.test(localPart)) {
            console.warn(`[AuthService] Regex failed for localPart: ${localPart}`);
            isValid = false;
          }
        }
      }

      if (!isValid) {
        // Audit failure via gRPC
        this.analyticsService.TrackEvent({
          eventType: 'SECURITY_ALERT',
          source: 'auth-service',
          userId: '',
          timestamp: Date.now().toString(),
          payloadJson: JSON.stringify({
            severity: 'HIGH',
            message: `Registro fallido por regex para universidad ${universityId}: ${cleanEmail}`
          })
        }).subscribe({
          error: (err) => console.error('[AuthService] Failed to emit analytics event', err.message)
        });

        throw new RpcException({
          code: 3,
          message: 'Email is invalid for the selected university or does not match institutional requirements',
        });
      }
      console.log('[AuthService] Student email validation successful');
    }
    
    // 2. Supabase Auth Registration with Metadata
    // CRITICAL: Metadata in options.data is used by DB triggers to populate public.users and profiles
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          university_id: data.university_id,
          role: data.role,
        },
      },
    });

    if (authError) {
      const errorMsg = authError.message.toLowerCase();
      const isConflict = errorMsg.includes('already registered') || 
                        errorMsg.includes('already exists') ||
                        authError.status === 422 || 
                        authError.status === 409;
      
      throw new RpcException({
        code: isConflict ? 6 : 3, // 6: ALREADY_EXISTS, 3: INVALID_ARGUMENT
        message: authError.message,
      });
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'Could not obtain user ID after registration',
      });
    }

    // 3. Manual Population of public.users and Profile
    // We do this because DB triggers might be missing or slow in this environment.
    console.log(`[AuthService] Manually populating public.users and profile for user ${userId}`);
    
    try {
      const universityId = data.university_id || data.universityId;
      
      // 3.1 Insert into public.users — CRÍTICO: si falla, el usuario no tiene perfil en la app.
      // En ese caso relanzamos para evitar un usuario zombie en auth.users sin datos de aplicación.
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: data.email,
          role: data.role as any,
          university_id: data.role === 'student' ? universityId : null,
          created_at: new Date().toISOString(),
          is_onboarded: false,
        });

      if (userError) {
        console.error('[AuthService] CRITICAL: Error inserting into public.users:', userError.message);
        // Detectar si el usuario ya existe (idempotencia en re-registros)
        const isAlreadyExists = 
          userError.code === '23505' || // PostgreSQL unique_violation
          userError.message?.toLowerCase().includes('already exists') ||
          userError.message?.toLowerCase().includes('duplicate');
        
        if (!isAlreadyExists) {
          throw new RpcException({
            code: 13, // INTERNAL
            message: `Failed to create user application record: ${userError.message}`,
          });
        }
        console.warn('[AuthService] public.users record already exists for this user — skipping insert.');
      }

      // 3.2 Insert into specific profile table
      const profileTable = data.role === 'student' ? 'student_profiles' : 'employer_profiles';
      const profileData: any = { id: userId };
      if (data.role === 'student') {
        profileData.university_id = universityId;
      } else if (data.role === 'employer') {
        profileData.name = 'Nueva Empresa'; // Valor por defecto temporal para evitar NOT NULL
      }

      const { error: profileError } = await supabase
        .from(profileTable as any)
        .insert(profileData);

      if (profileError) {
        // Si el perfil ya existe, es idempotente — no fallar
        const isAlreadyExists = 
          profileError.code === '23505' ||
          profileError.message?.toLowerCase().includes('already exists') ||
          profileError.message?.toLowerCase().includes('duplicate');
          
        if (!isAlreadyExists) {
          console.error(`[AuthService] Error inserting into ${profileTable}:`, profileError.message);
          // No lanzamos aquí: el perfil se puede completar en el onboarding
        } else {
          console.warn(`[AuthService] ${profileTable} record already exists — skipping insert.`);
        }
      }

    } catch (err: any) {
      // Re-lanzar RpcExceptions directamente
      if (err instanceof RpcException) throw err;
      console.error('[AuthService] Unexpected error during manual population:', err);
      throw new RpcException({
        code: 13,
        message: `Unexpected error during user initialization: ${err?.message || 'Unknown error'}`,
      });
    }

    // 4. Fetch the created profile to return it
    const profileTable = data.role === 'student' ? 'student_profiles' : 'employer_profiles';
    const { data: userProfile } = await supabase
      .from(profileTable as any)
      .select('*')
      .eq('id', userId)
      .single();

    if (!userProfile) {
      console.warn(`[AuthService] Profile still not found for user ${userId} after manual insert.`);
    }

    // 5. Return secure data (no password hashes)
    return {
      userId,
      email: data.email,
      role: data.role,
      profile: userProfile,
      session: authData.session,
    };
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
    const userId = data.user_id || data.userId;

    if (data.role === 'student') {
      const updateData: any = {};
      if (data.full_name !== undefined) updateData.full_name = data.full_name;
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      
      if (data.career !== undefined) updateData.career = data.career;
      
      if (data.academic_cycle !== undefined) updateData.academic_cycle = data.academic_cycle;
      if (data.academicCycle !== undefined) updateData.academic_cycle = data.academicCycle;

      const { error } = await supabase
        .from('student_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        throw new RpcException({ code: 13, message: error.message });
      }
    } else if (data.role === 'employer') {
      const updateData: any = {};
      if (data.company_name !== undefined) updateData.company_name = data.company_name;
      if (data.companyName !== undefined) updateData.company_name = data.companyName;
      
      if (data.sector !== undefined) updateData.sector = data.sector;

      const { error } = await supabase
        .from('employer_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        throw new RpcException({ code: 13, message: error.message });
      }
    }

    return { success: true };
  }

  async listUniversities() {
    const supabase = this.supabaseService.getClient<Database>();
    const { data, error } = await supabase
      .from('universities')
      .select('id, name, email_domain, slug')
      .eq('is_active', true);

    if (error) {
      throw new RpcException({ code: 13, message: error.message });
    }

    return { universities: data || [] };
  }

  async forgotPassword(data: { email: string }) {
    const supabase = this.supabaseService.getClient<Database>();
    
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      // La URL de redirección debe apuntar al frontend que procesará el token
      redirectTo: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
    });

    if (error) {
      throw new RpcException({
        code: 13,
        message: error.message,
      });
    }

    return { success: true, message: 'Se ha enviado un correo para restablecer tu contraseña' };
  }

  async resetPassword(data: { password: string, access_token?: string }) {
    // Si viene un token, necesitamos crear un cliente temporal con ese token
    // para que Supabase sepa qué usuario está actualizando su contraseña.
    let supabase = this.supabaseService.getClient<Database>();

    if (data.access_token) {
      // Nota: Aquí asumimos que el SupabaseService permite obtener un cliente con un token específico
      // o que podemos usar setSession. 
      // Si no, podemos usar el cliente actual si el Gateway ya pasó el token en el metadata
      // y el interceptor de Supabase lo inyectó.
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: '', // No es estrictamente necesario para un reset único
      });

      if (sessionError) {
        throw new RpcException({
          code: 16, // UNAUTHENTICATED
          message: 'Token de recuperación inválido o expirado',
        });
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new RpcException({
        code: 13,
        message: error.message,
      });
    }

    return { success: true, message: 'Contraseña actualizada exitosamente' };
  }
}
