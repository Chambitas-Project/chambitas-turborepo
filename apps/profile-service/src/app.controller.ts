import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ProfileService', 'UpdateStudentProfile')
  async updateStudentProfile(data: any) {
    return this.appService.updateStudentProfile(data);
  }

  @GrpcMethod('ProfileService', 'UpdateEmployerProfile')
  async updateEmployerProfile(data: any) {
    return this.appService.updateEmployerProfile(data);
  }
}
