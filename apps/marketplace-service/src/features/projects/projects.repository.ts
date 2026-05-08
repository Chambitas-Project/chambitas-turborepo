import { Injectable } from '@nestjs/common';
import { SupabaseService, Database, Tables, TablesInsert, TablesUpdate, Enums } from '@chambitas/supabase';


type ProjectWithUniversities = Omit<Tables<'projects'>, 'project_universities'> & {
  project_universities: { university_id: string }[];
};

@Injectable()
export class ProjectsRepository {
  constructor(private readonly supabaseService: SupabaseService) { }

  private get client() {
    return this.supabaseService.getClient<Database>();
  }

  async findById(id: string): Promise<(Tables<'projects'> & { university_ids: string[] }) | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('*, project_universities(university_id)')
      .eq('id', id)
      .is('deleted_at', null)
      .is('project_universities.deleted_at', null)
      .single();

    if (error || !data) return null;

    const projectData = data as unknown as ProjectWithUniversities;

    return {
      ...projectData,
      university_ids: (projectData.project_universities || []).map((pu: { university_id: string }) => pu.university_id),
    };
  }

  async findAll(filters: {
    employer_id?: string;
    status?: Enums<'project_status'>;
    service_category?: string;
    university_id?: string; // Student's university
    limit?: number;
    offset?: number;
  }): Promise<{ data: (Tables<'projects'> & { university_ids: string[] })[]; total: number }> {
    // Para el filtrado complejo de universidades (estudiante), usamos un enfoque de select con join
    let query = this.client
      .from('projects')
      .select('*, project_universities!left(university_id)', { count: 'exact' })
      .is('deleted_at', null);

    if (filters.employer_id) {
      query = query.eq('employer_id', filters.employer_id);
    }

    const statusFilter = filters.status || (!filters.employer_id ? 'open' : undefined);
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    if (filters.service_category) {
      query = query.eq('service_category', filters.service_category);
    }

    // Filtrado para estudiantes
    if (filters.university_id) {
      // Proyectos vinculados a la universidad del estudiante O globales (sin entradas en project_universities)
      // Nota: PostgREST no maneja fácilmente OR entre tablas. 
      // Una alternativa común es usar rpc o filtros manuales si el dataset es pequeño, 
      // pero aquí seguiremos la lógica de la política RLS si está activa.
      // Si el microservicio actúa como admin (service_role), debemos replicar la lógica.

      // Filtramos proyectos que:
      // 1. Tengan la universidad del estudiante en project_universities
      // 2. O no tengan ninguna universidad vinculada (proyectos globales)
      // Esto se puede hacer con una query anidada o filter string.
      query = query.or(`project_universities.university_id.eq.${filters.university_id},project_universities.is.null`);
    }

    if (filters.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Error listing projects: ${error.message}`);

    const formattedData = ((data as unknown as ProjectWithUniversities[]) || []).map(project => ({
      ...project,
      university_ids: (project.project_universities || []).map((pu: { university_id: string }) => pu.university_id),
    }));

    return {
      data: formattedData,
      total: count || 0,
    };
  }

  async create(data: TablesInsert<'projects'>, university_ids: string[] = []): Promise<Tables<'projects'> & { university_ids: string[] }> {
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
        // Soft delete the project if university link fails to maintain consistency
        await this.softDelete(project.id);
        throw new Error(`Error linking project to universities: ${uniError.message}`);
      }
    }

    return {
      ...project,
      university_ids: university_ids,
    };
  }

  async update(
    id: string,
    data: TablesUpdate<'projects'>,
    university_ids?: string[]
  ): Promise<Tables<'projects'> & { university_ids: string[] }> {
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
      // Soft delete existing and insert new ones (Standard approach)
      await this.client
        .from('project_universities')
        .update({ deleted_at: new Date().toISOString() })
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


