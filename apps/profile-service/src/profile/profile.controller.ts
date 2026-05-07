import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProfileService } from './profile.service';
import { 
  CreateStudentProfileRequest, 
  UpdateStudentProfileRequest, 
  CreateEmployerProfileRequest, 
  UpdateEmployerProfileRequest,
  GetProfileRequest,
  DeleteProfileRequest,
  ProfileResponse,
  StudentProfileResponse,
  EmployerProfileResponse
} from '@chambitas/proto';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @GrpcMethod('ProfileService', 'CreateStudentProfile')
  async createStudentProfile(data: CreateStudentProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.createStudentProfile(data);
  }

  @GrpcMethod('ProfileService', 'GetStudentProfile')
  async getStudentProfile(data: GetProfileRequest): Promise<StudentProfileResponse> {
    return await this.profileService.getStudentProfile(data.id);
  }

  @GrpcMethod('ProfileService', 'UpdateStudentProfile')
  async updateStudentProfile(data: UpdateStudentProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.updateStudentProfile(data);
  }

  @GrpcMethod('ProfileService', 'CreateEmployerProfile')
  async createEmployerProfile(data: CreateEmployerProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.createEmployerProfile(data);
  }

  @GrpcMethod('ProfileService', 'GetEmployerProfile')
  async getEmployerProfile(data: GetProfileRequest): Promise<EmployerProfileResponse> {
    return await this.profileService.getEmployerProfile(data.id);
  }

  @GrpcMethod('ProfileService', 'UpdateEmployerProfile')
  async updateEmployerProfile(data: UpdateEmployerProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.updateEmployerProfile(data);
  }

  @GrpcMethod('ProfileService', 'DeleteProfile')
  async deleteProfile(data: DeleteProfileRequest): Promise<ProfileResponse> {
    return await this.profileService.deleteProfile(data.userId);
  }
}
