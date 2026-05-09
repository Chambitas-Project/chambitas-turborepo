import { Injectable } from '@nestjs/common';
import { SupabaseService, Database, Tables, TablesInsert, TablesUpdate } from '@chambitas/supabase';

@Injectable()
export class StudentRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient<Database>();
  }

  async findById(id: string): Promise<Tables<'student_profiles'> | null> {
    const { data, error } = await this.client
      .from('student_profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data;
  }

  async findByUserId(userId: string): Promise<any> {
    const { data, error } = await this.client
      .from('student_profiles')
      .select(`
        *,
        user:users(is_onboarded),
        university:universities(name, logo_url),
        student_skills(
          proficiency_level,
          verified,
          skill:skills(id, name)
        )
      `)
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data;
  }

  async create(data: TablesInsert<'student_profiles'>): Promise<Tables<'student_profiles'>> {
    // Check if record exists even if soft-deleted
    const { data: existing } = await this.client
      .from('student_profiles')
      .select('id')
      .eq('id', data.id!)
      .single();

    if (existing) {
      // Restore and update
      const { data: profile, error } = await this.client
        .from('student_profiles')
        .update({ ...data, deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', data.id!)
        .select()
        .single();
      
      if (error) throw new Error(`Error restoring student profile: ${error.message}`);
      return profile;
    }

    const { data: profile, error } = await this.client
      .from('student_profiles')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Error creating student profile: ${error.message}`);
    return profile;
  }

  async update(userId: string, data: TablesUpdate<'student_profiles'>): Promise<void> {
    const { error } = await this.client
      .from('student_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw new Error(`Error updating student profile: ${error.message}`);
  }

  async softDelete(userId: string): Promise<void> {
    const { error } = await this.client
      .from('student_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw new Error(`Error soft deleting student profile: ${error.message}`);
  }
}
