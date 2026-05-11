import { Injectable } from '@nestjs/common';
import { SupabaseService, Database, Tables } from '@chambitas/supabase';

@Injectable()
export class CareersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient<Database>();
  }

  async findAll(filters: { university_id?: string; area?: string }): Promise<Tables<'careers'>[]> {
    let query = this.client.from('careers').select('*').eq('is_active', true);

    if (filters.university_id) {
      query = query.eq('university_id', filters.university_id);
    }

    if (filters.area) {
      query = query.eq('area', filters.area);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
