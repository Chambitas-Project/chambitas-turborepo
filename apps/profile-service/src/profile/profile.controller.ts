import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
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

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  private getUserFromMetadata(metadata: any): { userId: string; role: string } {
    const metadataMap = typeof metadata?.getMap === 'function' ? metadata.getMap() : {};
    const userId = metadataMap['user-id'] as string;
    const role = metadataMap['role'] as string;

    if (!userId || !role) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Missing user identity in gRPC metadata (user-id or role)',
      });
    }

    return { userId, role };
  }

  // ─── Read operations (no auth enforcement needed beyond JWT guard in Gateway) ───

  @GrpcMethod('ProfileService', 'CreateStudentProfile')
  async createStudentProfile(data: CreateStudentProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.createStudentProfile(data);
  }

  @GrpcMethod('ProfileService', 'GetStudentProfile')
  async getStudentProfile(data: { id: string }): Promise<StudentProfileResponse> {
    return await this.profileService.getStudentProfile(data.id) as any;
  }

  @GrpcMethod('ProfileService', 'CreateEmployerProfile')
  async createEmployerProfile(data: CreateEmployerProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.createEmployerProfile(data);
  }

  @GrpcMethod('ProfileService', 'GetEmployerProfile')
  async getEmployerProfile(data: { id: string }): Promise<EmployerProfileResponse> {
    return await this.profileService.getEmployerProfile(data.id) as any;
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

  @GrpcMethod('ProfileService', 'ListCareers')
  async listCareers(data: any) {
    return await this.profileService.listCareers(data);
  }

  // ─── Write operations (identity enforced from gRPC metadata) ───

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'UpdateStudentProfile')
  async updateStudentProfile(data: UpdateStudentProfileRequest, metadata: any): Promise<ProfileResponse> {
    const { userId } = this.getUserFromMetadata(metadata);
    data.user_id = userId;
    return await this.profileService.updateStudentProfile(data);
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'UpdateEmployerProfile')
  async updateEmployerProfile(data: UpdateEmployerProfileRequest, metadata: any): Promise<ProfileResponse> {
    const { userId } = this.getUserFromMetadata(metadata);
    data.user_id = userId;
    return await this.profileService.updateEmployerProfile(data);
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'DeleteProfile')
  async deleteProfile(data: { user_id: string }, metadata: any): Promise<ProfileResponse> {
    const { userId } = this.getUserFromMetadata(metadata);
    return await this.profileService.deleteProfile(userId);
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'CompleteOnboarding')
  async completeOnboarding(data: CompleteOnboardingRequest, metadata: any): Promise<ProfileResponse> {
    const { userId, role } = this.getUserFromMetadata(metadata);
    // Sobreescribir con identidad real del JWT — previene spoofing del payload
    (data as any).user_id = userId;
    (data as any).role = role;
    return await this.profileService.completeOnboarding(data);
  }

  @UseGuards(ProfileOwnerGuard)
  @CheckOwner('user_id')
  @GrpcMethod('ProfileService', 'UpdateProfile')
  async updateProfile(data: CompleteOnboardingRequest, metadata: any): Promise<ProfileResponse> {
    const { userId, role } = this.getUserFromMetadata(metadata);
    // Sobreescribir con identidad real del JWT
    (data as any).user_id = userId;
    (data as any).role = role;
    return await this.profileService.updateProfile(data);
  }
}
