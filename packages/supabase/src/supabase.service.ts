import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    // Use SERVICE_ROLE_KEY if available to bypass RLS in backend services
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY/SERVICE_ROLE_KEY must be defined');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  /** Cliente estándar tipado con el esquema de la DB */
  getClient<T>(): SupabaseClient<T> {
    return this.client as SupabaseClient<T>;
  }

  /**
   * Cliente con permisos de administrador (SERVICE_ROLE_KEY).
   * Permite operaciones como auth.admin.updateUserById.
   * Solo disponible en microservicios internos (nunca en el frontend).
   */
  getAdminClient<T>(): SupabaseClient<T> {
    return this.client as SupabaseClient<T>;
  }
}
