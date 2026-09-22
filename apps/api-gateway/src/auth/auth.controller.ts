import { Controller, Post, Body, Res, Inject, OnModuleInit, Req, UnauthorizedException, Get } from '@nestjs/common';
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
import { OAuthProcessDto } from './dto/oauth-process.dto';
import { firstValueFrom } from 'rxjs';
import { Public } from './decorators/public.decorator';
import {
  IAuthService,
  RegisterResponse,
  IProfileService,
  AuthResponse,
  OAuthCallbackRequest,
  OAuthCallbackResponse,
} from '@chambitas/proto';

const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
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
  @Post('oauth/process')
  @ApiOperation({ summary: 'Procesa tokens OAuth de Azure/Microsoft para estudiantes' })
  @ApiBody({ type: OAuthProcessDto })
  @ApiResponse({ status: 200, description: 'Sesión OAuth iniciada — cookie seteada' })
  @ApiResponse({ status: 401, description: 'Token inválido o correo no universitario' })
  async oauthProcess(
    @Body() dto: OAuthProcessDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await firstValueFrom<OAuthCallbackResponse>(
      this.authService.OAuthCallback({
        access_token: dto.access_token,
        refresh_token: dto.refresh_token,
      } as OAuthCallbackRequest)
    );

    // Setear cookie HttpOnly igual que en login normal
    res.cookie('access_token', dto.access_token, COOKIE_OPTIONS);

    return {
      userId: response.userId,
      email: response.email,
      role: response.role,
      isOnboarded: response.isOnboarded,
    };
  }

  @Public()
  @Get('oauth/azure/initiate')
  @ApiOperation({
    summary: 'Inicia el flujo OAuth de Azure/Microsoft para estudiantes',
    description: 'Redirige el navegador a la URL de autorización de Supabase+Azure. ' +
      'El frontend no necesita SDK de Supabase — solo navega a este endpoint.',
  })
  @ApiResponse({ status: 302, description: 'Redirect a Microsoft Login' })
  oauthAzureInitiate(@Res() res: Response) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

    if (!supabaseUrl) {
      return (res as any).status(500).json({ message: 'SUPABASE_URL no configurado' });
    }

    // URL de autorización OAuth de Supabase (sin SDK — formato estándar OIDC)
    // Supabase redirigirá a /auth/callback del frontend tras el login
    const callbackUrl = encodeURIComponent(`${frontendUrl}/auth/callback`);
    const scopes = encodeURIComponent('email openid profile');
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=azure&redirect_to=${callbackUrl}&scopes=${scopes}`;

    return (res as any).redirect(302, oauthUrl);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const response = await firstValueFrom(this.authService.Login(loginDto));

    if (loginDto.role && response.role !== loginDto.role) {
      const roleName = loginDto.role === 'student' ? 'Estudiante' : 'Empleador';
      throw new UnauthorizedException(`Esta cuenta no pertenece a un ${roleName}. Por favor, selecciona el rol correcto.`);
    }

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
