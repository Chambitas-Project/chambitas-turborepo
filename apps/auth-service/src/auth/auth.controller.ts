import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CurrentUser, IUserContext } from '@chambitas/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(@Payload() data: any, @CurrentUser() user: IUserContext) {
    return this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(@Payload() data: any) {
    // El Login es público, no requiere CurrentUser
    return this.authService.login(data);
  }

  @GrpcMethod('AuthService', 'UpdateOnboarding')
  async updateOnboarding(@Payload() data: any, @CurrentUser() user: IUserContext) {
    return this.authService.updateOnboarding({ ...data, userId: user.id });
  }

  @GrpcMethod('AuthService', 'ListUniversities')
  async listUniversities() {
    return this.authService.listUniversities();
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  async forgotPassword(@Payload() data: any) {
    return this.authService.forgotPassword(data);
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(@Payload() data: any) {
    return this.authService.resetPassword(data);
  }
}
