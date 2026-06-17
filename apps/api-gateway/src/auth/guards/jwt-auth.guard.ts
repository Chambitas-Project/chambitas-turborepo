import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    // 1. Verificar el token con Supabase Auth
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 2. Obtener el rol de APLICACIÓN desde public.users.
    //    IMPORTANTE: user.role del objeto Supabase Auth es SIEMPRE 'authenticated'
    //    (es el rol de la DB de Supabase, no el rol de negocio student/employer).
    //    Debemos consultar nuestra propia tabla public.users para obtener el rol real.
    const { data: appUser, error: userError } = await this.supabase
      .from('users')
      .select('role, is_onboarded')
      .eq('id', user.id)
      .single();

    if (userError || !appUser) {
      throw new UnauthorizedException('User profile not found. Please contact support.');
    }

    // 3. Inyectar el contexto completo del usuario en la request
    request['user'] = {
      id: user.id,
      email: user.email,
      role: appUser.role,              // 'student' | 'employer' — rol de aplicación real
      isOnboarded: appUser.is_onboarded ?? false,
    };

    return true;
  }

  private extractToken(request: any): string | undefined {
    // 1. Intentar extraer de la cookie HttpOnly
    if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'];
    }

    // 2. Fallback al header Authorization (para Swagger/Insomnia)
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
