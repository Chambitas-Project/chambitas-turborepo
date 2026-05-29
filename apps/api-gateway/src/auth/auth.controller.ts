import { Controller, Post, Body, Res, Inject, OnModuleInit, UseGuards, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { firstValueFrom } from 'rxjs';
import { Public } from './decorators/public.decorator';
import {
  IAuthService,
  RegisterResponse,
  LoginResponse,
  OnboardingResponse,
  IProfileService,
  AuthResponse
} from '@chambitas/proto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GrpcMetadataForwarder } from '@chambitas/common';
import { Metadata } from '@grpc/grpc-js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const,
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService!: IAuthService;
  private profileService!: IProfileService;

  constructor(
    @Inject('AUTH_PACKAGE') private client: ClientGrpc,
    @Inject('PROFILE_PACKAGE') private profileClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.authService = this.client.getService<IAuthService>('AuthService');
    this.profileService = this.profileClient.getService<IProfileService>('ProfileService');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    const response = await firstValueFrom(this.authService.Register(registerDto));
    return response;
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const response = await firstValueFrom(this.authService.Login(loginDto));

    // Extraer access_token y configurar cookie
    if (response.accessToken) {
      res.cookie('access_token', response.accessToken, COOKIE_OPTIONS);
    }

    return {
      userId: response.userId,
      email: response.email,
      role: response.role,
      isOnboarded: response.isOnboarded,
    };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    return { success: true };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Correo de recuperación enviado' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<AuthResponse> {
    return firstValueFrom(this.authService.ForgotPassword(dto));
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request): Promise<AuthResponse> {
    // Si no viene token en el body, intentamos sacarlo de la cookie (si el usuario ya fue redirigido)
    const token = dto.access_token || req.cookies?.access_token;

    return firstValueFrom(
      this.authService.ResetPassword({
        password: dto.password,
        access_token: token,
      })
    );
  }
}
