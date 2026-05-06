import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { GlobalRpcExceptionFilter } from '@chambitas/common';

@Controller()
@UseFilters(GlobalRpcExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: any, metadata: any, call: any) {
    return this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any, metadata: any, call: any) {
    return this.authService.login(data);
  }

  @GrpcMethod('AuthService', 'UpdateOnboarding')
  async updateOnboarding(data: any, metadata: any, call: any) {
    // correlationId and other metadata can be found in data if GrpcContextInterceptor is used
    return this.authService.updateOnboarding(data);
  }
}
