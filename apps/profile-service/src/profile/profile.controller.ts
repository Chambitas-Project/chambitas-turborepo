import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProfileService } from './profile.service';
import { ProfileOwnerGuard, CheckOwner } from '@chambitas/common';
import { 
  CreateStudentProfileRequest, 
  UpdateStudentProfileRequest, 
  CreateEmployerProfileRequest, 
  UpdateEmployerProfileRequest,
  ProfileResponse,
  StudentProfileResponse,
  EmployerProfileResponse,
  CompleteOnboardingRequest
} from '@chambitas/proto';
import { CurrentUser, IUserContext } from '@chambitas/common';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @GrpcMethod('ProfileService', 'CreateStudentProfile')
  async createStudentProfile(data: CreateStudentProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.createStudentProfile(data);
  }

  @GrpcMethod('ProfileService', 'GetStudentProfile')
  async getStudentProfile(data: { id: string }): Promise<StudentProfileResponse> {
    return await this.profileService.getStudentProfile(data.id) as any;
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'UpdateStudentProfile')
  async updateStudentProfile(data: UpdateStudentProfileRequest, @CurrentUser() user: IUserContext): Promise<ProfileResponse> {
    // Asegurar que el user_id sea el del usuario autenticado
    data.user_id = user.id;
    return await this.profileService.updateStudentProfile(data);
  }

  @GrpcMethod('ProfileService', 'CreateEmployerProfile')
  async createEmployerProfile(data: CreateEmployerProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.createEmployerProfile(data);
  }

  @GrpcMethod('ProfileService', 'GetEmployerProfile')
  async getEmployerProfile(data: { id: string }): Promise<EmployerProfileResponse> {
    return await this.profileService.getEmployerProfile(data.id) as any;
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'UpdateEmployerProfile')
  async updateEmployerProfile(data: UpdateEmployerProfileRequest, @CurrentUser() user: IUserContext): Promise<ProfileResponse> {
    // Asegurar que el user_id sea el del usuario autenticado
    data.user_id = user.id;
    return await this.profileService.updateEmployerProfile(data);
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'DeleteProfile')
  async deleteProfile(data: { user_id: string }): Promise<ProfileResponse> {
    return await this.profileService.deleteProfile(data.user_id);
  }

  @GrpcMethod('ProfileService', 'SearchProfiles')
  async searchProfiles(data: any) {
    return await this.profileService.searchProfiles(data.query, data.role, data.limit, data.offset);
  }

  @GrpcMethod('ProfileService', 'GetProfile')
  async getProfile(data: any) {
    return await this.profileService.getProfile(data.id);
  }
  @GrpcMethod('ProfileService', 'ListSkills')
  async listSkills(data: any) {
    return await this.profileService.listSkills(data.category);
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'CompleteOnboarding')
  async completeOnboarding(data: CompleteOnboardingRequest, @CurrentUser() user: IUserContext): Promise<ProfileResponse> {
    // Forzar identidad desde el contexto de seguridad (JWT -> gRPC Metadata)
    data.user_id = user.id;
    data.role = user.role;
    
    return await this.profileService.completeOnboarding(data);
  }
}
