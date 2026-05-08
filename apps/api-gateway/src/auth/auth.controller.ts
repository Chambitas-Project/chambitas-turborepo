import { Controller, Post, Body, Res, Inject, OnModuleInit, UseGuards, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiExtraModels, 
  getSchemaPath 
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { RegisterDto, LoginDto, StudentOnboardingDto, EmployerOnboardingDto } from './dto/auth.dto';
import { firstValueFrom } from 'rxjs';
import { Public } from './decorators/public.decorator';
import { 
  IAuthService, 
  RegisterResponse, 
  LoginResponse, 
  OnboardingResponse,
  IProfileService 
} from '@chambitas/proto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Metadata } from '@grpc/grpc-js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@ApiTags('Auth')
@ApiExtraModels(StudentOnboardingDto, EmployerOnboardingDto)
@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService!: IAuthService;
  private profileService!: IProfileService;

  constructor(
    @Inject('AUTH_PACKAGE') private client: ClientGrpc,
    @Inject('PROFILE_PACKAGE') private profileClient: ClientGrpc,
  ) {}

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

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar perfil de onboarding (Campos automáticos según rol)' })
  @ApiBody({ 
    description: 'Si eres estudiante, llena los campos de estudiante. Si eres empleador, los de empleador.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(StudentOnboardingDto) },
        { $ref: getSchemaPath(EmployerOnboardingDto) },
      ],
    },
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  async updateOnboarding(@Body() dto: any, @Req() req: Request) {
    const user = (req as any).user;
    const userId = user?.id;
    const role = user?.role;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    // Mapear campos para asegurar snake_case y consistencia con CompleteOnboardingRequest
    const requestPayload = {
      ...dto,
      user_id: userId,
      role,
    };

    // Propagar identidad mediante metadatos gRPC
    const metadata = new Metadata();
    metadata.add('user-id', userId);
    metadata.add('role', role);

    // Redirigir al ProfileService para un onboarding completo y robusto
    const response = await firstValueFrom(
      this.profileService.CompleteOnboarding(requestPayload, metadata)
    );
    
    return response;
  }
}
