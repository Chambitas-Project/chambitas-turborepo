import { Injectable } from '@nestjs/common';
import { SupabaseService, Database, Tables, TablesInsert, TablesUpdate } from '@chambitas/supabase';

@Injectable()
export class EmployerRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient<Database>();
  }

  async findByUserId(userId: string): Promise<Tables<'employer_profiles'> | null> {
    const { data, error } = await this.client
      .from('employer_profiles')
      .select('*, user:users(is_onboarded)')
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data;
  }

  async create(data: TablesInsert<'employer_profiles'>): Promise<Tables<'employer_profiles'>> {
    // Check if record exists even if soft-deleted
    const { data: existing } = await this.client
      .from('employer_profiles')
      .select('id')
      .eq('id', data.id!)
      .single();

    if (existing) {
      // Restore and update
      const { data: profile, error } = await this.client
        .from('employer_profiles')
        .update({ ...data, deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', data.id!)
        .select()
        .single();
      
      if (error) throw new Error(`Error restoring employer profile: ${error.message}`);
      return profile;
    }

    const { data: profile, error } = await this.client
      .from('employer_profiles')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Error creating employer profile: ${error.message}`);
    return profile;
  }

  async update(userId: string, data: TablesUpdate<'employer_profiles'>): Promise<void> {
    const { error } = await this.client
      .from('employer_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw new Error(`Error updating employer profile: ${error.message}`);
  }

  async softDelete(userId: string): Promise<void> {
    const { error } = await this.client
      .from('employer_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw new Error(`Error soft deleting employer profile: ${error.message}`);
  }
}
