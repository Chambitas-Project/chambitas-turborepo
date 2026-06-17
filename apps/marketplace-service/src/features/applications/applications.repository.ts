import { Injectable } from '@nestjs/common';
import { SupabaseService, Database, Tables, TablesInsert, TablesUpdate, Enums } from '@chambitas/supabase';

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly supabaseService: SupabaseService) { }

  private get client() {
    return this.supabaseService.getClient<Database>();
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.client
      .from('applications')
      .select('*, projects(title, employer_id), student_profiles(full_name, academic_cycle, careers(name), student_skills(proficiency_level, verified, skills(id, name))), matches(score)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data;
  }

  async findActiveByStudentAndProject(studentId: string, projectId: string): Promise<Tables<'applications'> | null> {
    const { data, error } = await this.client
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) return null;
    return data;
  }

  async findAll(filters: {
    student_id?: string;
    project_id?: string;
    status?: Enums<'application_status'>;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[]; total: number }> {
    let query = this.client
      .from('applications')
      .select('*, projects(title, employer_id), student_profiles(full_name, academic_cycle, careers(name), student_skills(proficiency_level, verified, skills(id, name))), matches(score)', { count: 'exact' })
      .is('deleted_at', null);

    const isUuid = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

    if (filters.student_id) {
      if (!isUuid(filters.student_id)) {
        throw new Error(`invalid input syntax for type uuid: "${filters.student_id}"`);
      }
      query = query.eq('student_id', filters.student_id);
    }

    if (filters.project_id) {
      if (!isUuid(filters.project_id)) {
        throw new Error(`invalid input syntax for type uuid: "${filters.project_id}"`);
      }
      query = query.eq('project_id', filters.project_id);
    }
    if (filters.status) query = query.eq('status', filters.status);

    if (filters.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Error listing applications: ${error.message}`);

    return {
      data: data || [],
      total: count || 0,
    };
  }

  async create(data: TablesInsert<'applications'>): Promise<Tables<'applications'>> {
    const { data: application, error } = await this.client
      .from('applications')
      .insert({
        ...data,
        status: 'pending',
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating application: ${error.message}`);
    return application;
  }

  async updateStatus(id: string, status: Enums<'application_status'>): Promise<Tables<'applications'>> {
    const { data: application, error } = await this.client
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating application status: ${error.message}`);
    return application;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from('applications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Error soft deleting application: ${error.message}`);
  }

  async getStudentValidationData(studentId: string): Promise<{ university_id: string; skills: { skill_id: string; proficiency_level: number }[] } | null> {
    const { data, error } = await this.client
      .from('student_profiles')
      .select('university_id, student_skills(skill_id, proficiency_level)')
      .eq('id', studentId)
      .single();

    if (error || !data) return null;

    return {
      university_id: data.university_id,
      skills: (data.student_skills as any[] || []).map(ss => ({
        skill_id: ss.skill_id,
        proficiency_level: ss.proficiency_level || 1,
      })),
    };
  }
}
