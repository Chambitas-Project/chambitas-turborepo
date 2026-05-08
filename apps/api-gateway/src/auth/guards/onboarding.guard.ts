import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class OnboardingGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY/SERVICE_ROLE_KEY must be defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (!user || !user.id) {
      return false; // Debería haber pasado por JwtAuthGuard antes
    }

    // Consultar el estado fresco en public.users
    const { data: dbUser, error } = await this.supabase
      .from('users')
      .select('is_onboarded')
      .eq('id', user.id)
      .single();

    if (error || !dbUser) {
      throw new ForbiddenException('User record not found');
    }

    if (!dbUser.is_onboarded) {
      throw new ForbiddenException({
        message: 'Onboarding mandatory',
        code: 'ONBOARDING_REQUIRED',
        description: 'Debes completar tu perfil antes de acceder a esta funcionalidad.'
      });
    }

    // Actualizar el objeto user en la request con el estado de onboarding
    request['user'].is_onboarded = true;

    return true;
  }
}
