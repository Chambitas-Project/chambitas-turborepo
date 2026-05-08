import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SupabaseService, Database } from '@chambitas/supabase';
import { UNIVERSITY_EMAIL_PATTERNS } from '@chambitas/common';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

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
        // Audit failure
        await supabase.from('security_audit_logs').insert({
          event_type: 'regex_fail',
          severity: 'warning',
          university_id: universityId,
          metadata: { email: cleanEmail, reason: 'University email validation failed' },
          created_at: new Date().toISOString(),
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

    // 3. Retry Pattern for Profile (Wait for DB Triggers to execute)
    let userProfile = null;
    const maxRetries = 3;
    const delay = 500;

    for (let i = 0; i < maxRetries; i++) {
      const profileTable = data.role === 'student' ? 'student_profiles' : 'employer_profiles';
      const { data: profile } = await supabase
        .from(profileTable as any)
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        userProfile = profile;
        break;
      }

      console.log(`[AuthService] Retry ${i + 1}/${maxRetries} to fetch profile for user ${userId}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (!userProfile) {
      console.warn(`[AuthService] Profile not found after ${maxRetries} retries for user ${userId}. Triggers might be slow.`);
    }

    // 4. Return secure data (no password hashes)
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
}
