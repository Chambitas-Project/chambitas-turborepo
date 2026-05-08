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
import { IAuthService, RegisterResponse, LoginResponse, OnboardingResponse } from '@chambitas/proto';

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

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<IAuthService>('AuthService');
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

    const requestPayload = {
      ...dto,
      user_id: userId,
      role,
    };

    const response = await firstValueFrom(
      this.authService.UpdateOnboarding(requestPayload)
    );
    return response;
  }
}
