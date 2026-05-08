import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Inject, 
  OnModuleInit, 
  UseGuards,
  Req, 
  Query, 
  ParseUUIDPipe,
  HttpStatus
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiExtraModels, 
  getSchemaPath 
} from '@nestjs/swagger';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { 
  CreateStudentProfileDto, 
  UpdateStudentProfileDto, 
  CreateEmployerProfileDto, 
  UpdateEmployerProfileDto 
} from './dto/profile.dto';
import { StudentOnboardingDto, EmployerOnboardingDto } from './dto/onboarding.dto';
import { IProfileService } from '@chambitas/proto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { createGrpcMetadata } from '../auth/utils/grpc-metadata.util';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(StudentOnboardingDto, EmployerOnboardingDto)
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController implements OnModuleInit {
  private profileService!: IProfileService;

  constructor(@Inject('PROFILE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.profileService = this.client.getService<IProfileService>('ProfileService');
  }

  // --- Unified Profiles ---

  @Get('me')
  @ApiOperation({ summary: 'Obtener el perfil del usuario actual' })
  async getMyProfile(@Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    return await firstValueFrom(
      this.profileService.GetProfile({ id: user.id }, metadata)
    );
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualización parcial del perfil del usuario actual' })
  async updateMyProfile(@Body() dto: any, @Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);

    if (user.role === 'student') {
      return await firstValueFrom(
        this.profileService.UpdateStudentProfile({ ...dto, userId: user.id }, metadata)
      );
    } else {
      return await firstValueFrom(
        this.profileService.UpdateEmployerProfile({ ...dto, userId: user.id }, metadata)
      );
    }
  }

  @Post('onboarding/student')
  @ApiOperation({ summary: 'Completar onboarding como Estudiante' })
  @ApiBody({ type: StudentOnboardingDto })
  @ApiResponse({ status: 200, description: 'Onboarding completado' })
  async completeStudentOnboarding(@Body() dto: StudentOnboardingDto, @Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    return await firstValueFrom(
      this.profileService.CompleteOnboarding({ 
        ...dto, 
        user_id: user.id,
        role: 'student' 
      }, metadata)
    );
  }

  @Post('onboarding/employer')
  @ApiOperation({ summary: 'Completar onboarding como Empleador' })
  @ApiBody({ type: EmployerOnboardingDto })
  @ApiResponse({ status: 200, description: 'Onboarding completado' })
  async completeEmployerOnboarding(@Body() dto: EmployerOnboardingDto, @Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    return await firstValueFrom(
      this.profileService.CompleteOnboarding({ 
        ...dto, 
        user_id: user.id,
        role: 'employer' 
      }, metadata)
    );
  }

  @Delete('me')
  @ApiOperation({ summary: 'Soft delete del perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil desactivado' })
  async deleteProfile(@Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    return await firstValueFrom(
      this.profileService.DeleteProfile({ user_id: user.id }, metadata)
    );
  }

  @Get('skills')
  @ApiOperation({ summary: 'Obtener todas las habilidades disponibles' })
  @ApiResponse({ status: 200, description: 'Lista completa de habilidades' })
  async getSkills(@Req() req: Request) {
    const metadata = createGrpcMetadata((req as any).user);
    return await firstValueFrom(
      this.profileService.ListSkills({}, metadata)
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar perfiles' })
  async searchProfiles(
    @Req() req: Request,
    @Query('q') query: string,
    @Query('role') role?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    const metadata = createGrpcMetadata((req as any).user);
    return await firstValueFrom(
      this.profileService.SearchProfiles({ 
        query, 
        role, 
        limit: limit || 10, 
        offset: offset || 0 
      }, metadata)
    );
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Obtener perfil por ID' })
  @ApiParam({ name: 'id', description: 'UUID del perfil o usuario' })
  async getProfileById(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const metadata = createGrpcMetadata((req as any).user);
    return await firstValueFrom(
      this.profileService.GetProfile({ id }, metadata)
    );
  }

  @Get(':username')
  @ApiOperation({ summary: 'Obtener perfil por nombre de usuario' })
  @ApiParam({ name: 'username', description: 'Username del perfil' })
  async getProfileByUsername(@Param('username') username: string, @Req() req: Request) {
    const metadata = createGrpcMetadata((req as any).user);
    return await firstValueFrom(
      this.profileService.GetProfile({ id: username }, metadata)
    );
  }
}
