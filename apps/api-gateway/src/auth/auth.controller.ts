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
import { RegisterDto, LoginDto } from './dto/auth.dto';
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
import { GrpcMetadataForwarder } from '@chambitas/common';
import { Metadata } from '@grpc/grpc-js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
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

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    return { success: true };
  }

}
