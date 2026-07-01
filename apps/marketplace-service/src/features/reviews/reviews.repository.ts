import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService, Database, Tables } from '@chambitas/supabase';

@Injectable()
export class ReviewsRepository {
  private readonly logger = new Logger(ReviewsRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient<Database>();
  }

  async create(data: {
    application_id: string;
    reviewer_id: string;
    reviewer_role: 'employer' | 'student';
    rating: number;
    comment: string;
  }): Promise<Tables<'reviews'>> {
    const { data: review, error } = await this.supabase
      .from('reviews')
      .insert(data)
      .select(`
        *,
        reviewer:users!reviewer_id(
          id,
          role,
          student_profiles(full_name),
          employer_profiles(name, company_name)
        )
      `)
      .single();

    if (error) {
      this.logger.error(`Error creating review: ${error.message}`);
      throw error;
    }

    return review;
  }

  async findById(id: string): Promise<Tables<'reviews'> | null> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  }

  async findByApplicationId(applicationId: string): Promise<Tables<'reviews'>[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('application_id', applicationId);

    if (error) throw error;
    return data || [];
  }

  async findByTargetId(filters: { student_id?: string; employer_id?: string; project_id?: string }) {
    // Si filtramos por student_id o employer_id, necesitamos un !inner join
    const applicationJoin = (filters.student_id || filters.employer_id || filters.project_id) ? 'application:applications!application_id!inner' : 'application:applications!application_id';
    
    let query = this.supabase.from('reviews').select(`
      *,
      reviewer:users!reviewer_id(
        id,
        role,
        student_profiles(full_name),
        employer_profiles(name, company_name)
      ),
      ${applicationJoin}(
        project_id,
        student_id,
        projects!project_id!inner(employer_id)
      )
    `);

    if (filters.student_id) {
      query = query.eq('application.student_id', filters.student_id).eq('reviewer_role', 'employer');
    }

    if (filters.employer_id) {
      query = query.eq('application.projects.employer_id', filters.employer_id).eq('reviewer_role', 'student');
    }

    if (filters.project_id) {
      query = query.eq('application.project_id', filters.project_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async update(id: string, data: { rating?: number; comment?: string }): Promise<Tables<'reviews'>> {
    const { data: review, error } = await this.supabase
      .from('reviews')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        reviewer:users!reviewer_id(
          id,
          role,
          student_profiles(full_name),
          employer_profiles(name, company_name)
        )
      `)
      .single();

    if (error) {
      this.logger.error(`Error updating review: ${error.message}`);
      throw error;
    }

    return review;
  }

  async softDelete(id: string): Promise<Tables<'reviews'>> {
    const { data: review, error } = await this.supabase
      .from('reviews')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error deleting review: ${error.message}`);
      throw error;
    }

    return review;
  }
}
