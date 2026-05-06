import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async updateStudentProfile(data: any) {
    const supabase = this.supabaseService.getClient<Database>();
    const updateData: any = {};

    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.career !== undefined) updateData.career = data.career;
    if (data.academicCycle !== undefined) updateData.academic_cycle = data.academicCycle;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.universityId !== undefined) updateData.university_id = data.universityId;
    
    if (data.availabilityBlocks !== undefined) {
      try {
        updateData.availability_blocks = JSON.parse(data.availabilityBlocks);
      } catch (e) {
        throw new RpcException({ code: 3, message: 'Invalid JSON for availability_blocks' });
      }
    }

    const { error } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('id', data.userId);

    if (error) {
      throw new RpcException({ code: 13, message: error.message });
    }

    const isOnboarded = await this.checkIfProfileIsComplete(data.userId, 'student');
    return { isOnboarded };
  }

  async updateEmployerProfile(data: any) {
    const supabase = this.supabaseService.getClient<Database>();
    const updateData: any = {};

    if (data.companyName !== undefined) updateData.company_name = data.companyName;
    if (data.ruc !== undefined) updateData.ruc = data.ruc;
    if (data.sector !== undefined) updateData.sector = data.sector;

    const { error } = await supabase
      .from('employer_profiles')
      .update(updateData)
      .eq('id', data.userId);

    if (error) {
      throw new RpcException({ code: 13, message: error.message });
    }

    const isOnboarded = await this.checkIfProfileIsComplete(data.userId, 'employer');
    return { isOnboarded };
  }

  private async checkIfProfileIsComplete(userId: string, role: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient<Database>();

    // Get current is_onboarded status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_onboarded')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new RpcException({ code: 13, message: 'Could not fetch user' });
    }

    // If already onboarded, no need to check again
    if (user.is_onboarded) {
      return true;
    }

    let isComplete = false;

    if (role === 'student') {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('full_name, career')
        .eq('id', userId)
        .single();
      
      if (profile && profile.full_name && profile.career) {
        isComplete = true;
      }
    } else if (role === 'employer') {
      const { data: profile } = await supabase
        .from('employer_profiles')
        .select('company_name, ruc')
        .eq('id', userId)
        .single();

      if (profile && profile.company_name && profile.ruc) {
        isComplete = true;
      }
    }

    if (isComplete) {
      await supabase
        .from('users')
        .update({ is_onboarded: true })
        .eq('id', userId);
    }

    return isComplete;
  }
}
