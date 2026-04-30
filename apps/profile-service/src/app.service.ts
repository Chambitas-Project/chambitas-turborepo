import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '@chambitas/supabase';
import { Database } from '@chambitas/supabase';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) { }

  getHello(): string {
    return 'Profile Service is running';
  }

  async getProfile(id: string) {
    const { data, error } = await this.supabaseService.getClient<Database>()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
