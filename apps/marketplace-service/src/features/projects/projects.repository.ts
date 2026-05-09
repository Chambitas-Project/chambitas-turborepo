import { Injectable } from '@nestjs/common';
import { SupabaseService, Database, Tables, TablesInsert, TablesUpdate, Enums } from '@chambitas/supabase';


type ProjectWithRelations = Tables<'projects'> & {
  project_universities: { university_id: string }[];
  project_required_skills: (Tables<'project_required_skills'> & { skills: { name: string } })[];
};

@Injectable()
export class ProjectsRepository {
  constructor(private readonly supabaseService: SupabaseService) { }

  private get client() {
    return this.supabaseService.getClient<Database>();
  }

  async findById(id: string): Promise<(Tables<'projects'> & { university_ids: string[]; skills: any[] }) | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('*, project_universities(university_id), project_required_skills(*, skills(name))')
      .eq('id', id)
      .is('deleted_at', null)
      .is('project_universities.deleted_at', null)
      .single();

    if (error || !data) return null;

    const projectData = data as unknown as ProjectWithRelations;

    return {
      ...projectData,
      university_ids: (projectData.project_universities || []).map(pu => pu.university_id),
      skills: (projectData.project_required_skills || []).map(ps => ({
        skill_id: ps.skill_id,
        skill_name: ps.skills?.name,
        min_proficiency: ps.min_proficiency,
        mandatory: ps.mandatory
      }))
    };
  }

  async findAll(filters: {
    employer_id?: string;
    status?: Enums<'project_status'>;
    service_category?: string;
    university_id?: string; // Student's university
    limit?: number;
    offset?: number;
  }): Promise<{ data: (Tables<'projects'> & { university_ids: string[]; skills: any[] })[]; total: number }> {
    let query = this.client
      .from('projects')
      .select('*, project_universities!left(university_id), project_required_skills(*, skills(name))', { count: 'exact' })
      .is('deleted_at', null);
    
    // ... filtros existentes ...
    if (filters.employer_id) query = query.eq('employer_id', filters.employer_id);
    const statusFilter = filters.status || (!filters.employer_id ? 'open' : undefined);
    if (statusFilter) query = query.eq('status', statusFilter);
    if (filters.service_category) query = query.eq('service_category', filters.service_category);
    if (filters.university_id) query = query.or(`project_universities.university_id.eq.${filters.university_id},project_universities.is.null`);

    if (filters.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Error listing projects: ${error.message}`);

    const formattedData = ((data as unknown as ProjectWithRelations[]) || []).map(project => ({
      ...project,
      university_ids: (project.project_universities || []).map(pu => pu.university_id),
      skills: (project.project_required_skills || []).map(ps => ({
        skill_id: ps.skill_id,
        skill_name: ps.skills?.name,
        min_proficiency: ps.min_proficiency,
        mandatory: ps.mandatory
      }))
    }));

    return {
      data: formattedData,
      total: count || 0,
    };
  }

  async create(
    data: TablesInsert<'projects'>, 
    university_ids: string[] = [], 
    skills: any[] = []
  ): Promise<Tables<'projects'> & { university_ids: string[]; skills: any[] }> {
    // 1. Insert Project
    const { data: project, error: projectError } = await this.client
      .from('projects')
      .insert({
        ...data,
        status: data.status || 'open',
      })
      .select()
      .single();

    if (projectError) throw new Error(`Error creating project: ${projectError.message}`);

    // 2. Insert Universities relationships if any
    if (university_ids.length > 0) {
      const universityEntries = university_ids.map(uId => ({
        project_id: project.id,
        university_id: uId,
      }));

      const { error: uniError } = await this.client
        .from('project_universities')
        .insert(universityEntries);

      if (uniError) {
        await this.softDelete(project.id);
        throw new Error(`Error linking project to universities: ${uniError.message}`);
      }
    }

    // 3. Insert Required Skills if any
    if (skills.length > 0) {
      const skillEntries = skills.map(s => ({
        project_id: project.id,
        skill_id: s.skill_id,
        min_proficiency: s.min_proficiency || 1,
        mandatory: s.mandatory !== undefined ? s.mandatory : true,
      }));

      const { error: skillError } = await this.client
        .from('project_required_skills')
        .insert(skillEntries);

      if (skillError) {
        await this.softDelete(project.id);
        throw new Error(`Error linking project to skills: ${skillError.message}`);
      }
    }

    const finalProject = await this.findById(project.id);
    return finalProject!;
  }

  async update(
    id: string,
    data: TablesUpdate<'projects'>,
    university_ids?: string[],
    skills?: any[]
  ): Promise<Tables<'projects'> & { university_ids: string[]; skills: any[] }> {
    // 1. Update project fields
    const { data: project, error: projectError } = await this.client
      .from('projects')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (projectError) throw new Error(`Error updating project: ${projectError.message}`);

    // 2. Update universities if provided
    if (university_ids !== undefined) {
      await this.client
        .from('project_universities')
        .delete() // Hard delete for relations table is cleaner if it's just a mapping
        .eq('project_id', id);

      if (university_ids.length > 0) {
        const universityEntries = university_ids.map(uId => ({
          project_id: id,
          university_id: uId,
        }));

        const { error: uniError } = await this.client
          .from('project_universities')
          .insert(universityEntries);

        if (uniError) throw new Error(`Error updating project universities: ${uniError.message}`);
      }
    }

    // 3. Update skills if provided
    if (skills !== undefined) {
      await this.client
        .from('project_required_skills')
        .delete()
        .eq('project_id', id);

      if (skills.length > 0) {
        const skillEntries = skills.map(s => ({
          project_id: id,
          skill_id: s.skill_id,
          min_proficiency: s.min_proficiency || 1,
          mandatory: s.mandatory !== undefined ? s.mandatory : true,
        }));

        const { error: skillError } = await this.client
          .from('project_required_skills')
          .insert(skillEntries);

        if (skillError) throw new Error(`Error updating project skills: ${skillError.message}`);
      }
    }

    const finalProject = await this.findById(id);
    return finalProject!;
  }

  async softDelete(id: string): Promise<void> {
    const now = new Date().toISOString();

    // Soft delete project
    const { error: projectError } = await this.client
      .from('projects')
      .update({ deleted_at: now })
      .eq('id', id);

    if (projectError) throw new Error(`Error soft deleting project: ${projectError.message}`);

    // Soft delete relationships
    await this.client
      .from('project_universities')
      .update({ deleted_at: now })
      .eq('project_id', id);
  }
}


