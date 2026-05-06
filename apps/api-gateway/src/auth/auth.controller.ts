import { Controller, Post, Body, Res, Inject, OnModuleInit, UseGuards, Req } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { RegisterDto, LoginDto, UpdateOnboardingDto } from './dto/auth.dto';
import { firstValueFrom } from 'rxjs';
import { Public } from './decorators/public.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService: any;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService('AuthService');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  async register(@Body() registerDto: RegisterDto) {
    const response: any = await firstValueFrom(this.authService.Register(registerDto));
    return response;
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const response: any = await firstValueFrom(this.authService.Login(loginDto));
    
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
  @ApiOperation({ summary: 'Actualizar perfil de onboarding' })
  @ApiBody({ type: UpdateOnboardingDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  async updateOnboarding(@Body() dto: UpdateOnboardingDto, @Req() req: Request) {
    // El Gateway debe extraer el user_id e inyectarlo
    // Suponiendo que JwtAuthGuard inyecta el usuario en req.user
    const user = (req as any).user;
    const userId = user?.id; // Ajustar según cómo JwtAuthGuard inyecta el usuario
    const role = user?.role;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const requestPayload = {
      ...dto,
      userId,
      role,
    };

    const response: any = await firstValueFrom(
      this.authService.UpdateOnboarding(requestPayload)
    );
    return response;
  }
}
