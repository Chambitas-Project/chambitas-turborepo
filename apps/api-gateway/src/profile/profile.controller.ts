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
import { StudentOnboardingDto, EmployerOnboardingDto, UpdateProfileDto } from './dto/onboarding.dto';
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
    const profile = await firstValueFrom(
      this.profileService.GetProfile({ id: user.id }, metadata)
    );

    // Map snake_case from gRPC to camelCase for Frontend
    const { 
      full_name, 
      university_name, 
      university_logo,
      academic_cycle, 
      is_onboarded, 
      ...rest 
    } = profile;

    return {
      ...rest,
      fullName: full_name,
      companyName: profile.company_name,
      commercialName: profile.commercial_name,
      universityName: university_name,
      universityLogo: university_logo,
      academicCycle: academic_cycle,
      isOnboarded: is_onboarded,
      availabilityBlocks: profile.availability_blocks 
        ? (typeof profile.availability_blocks === 'string' ? JSON.parse(profile.availability_blocks) : profile.availability_blocks)
        : null,
      skills: profile.skills?.map(({ proficiency_level, ...s }) => ({
        ...s,
        level: proficiency_level
      })) || []
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualización parcial del perfil del usuario actual' })
  @ApiBody({ type: UpdateProfileDto })
  async updateMyProfile(@Body() dto: UpdateProfileDto, @Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    
    // Preparamos el payload para gRPC
    const payload: any = { 
      ...dto,
      user_id: user.id,
      role: user.role
    };

    if (dto.availability_blocks) {
      payload.availability_blocks = JSON.stringify(dto.availability_blocks);
    }

    return firstValueFrom(
      this.profileService.UpdateProfile(payload, metadata)
    );
  }

  @Post('onboarding/student')
  @ApiOperation({ summary: 'Completar onboarding como Estudiante' })
  @ApiBody({ type: StudentOnboardingDto })
  @ApiResponse({ status: 200, description: 'Onboarding completado' })
  async completeStudentOnboarding(@Body() dto: StudentOnboardingDto, @Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    const result = await firstValueFrom(
      this.profileService.CompleteOnboarding({
        user_id: user.id,
        role: 'student',
        full_name: dto.full_name,
        career_id: dto.career_id,
        academic_cycle: dto.academic_cycle,
        bio: dto.bio,
        gpa: dto.gpa,
        availability_blocks: dto.availability_blocks ? JSON.stringify(dto.availability_blocks) : undefined,
        // Mapear skill_inputs del DTO al formato del proto
        skill_inputs: dto.skill_inputs.map(s => ({
          name: s.name,
          proficiency_level: s.proficiency_level ?? 1,
        })),
      } as any, metadata)
    );

    return {
      success: result.success,
      message: result.message,
      isOnboarded: result.is_onboarded
    };
  }

  @Post('onboarding/employer')
  @ApiOperation({ summary: 'Completar onboarding como Empleador' })
  @ApiBody({ type: EmployerOnboardingDto })
  @ApiResponse({ status: 200, description: 'Onboarding completado' })
  async completeEmployerOnboarding(@Body() dto: EmployerOnboardingDto, @Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    const result = await firstValueFrom(
      this.profileService.CompleteOnboarding({ 
        ...dto, 
        user_id: user.id,
        role: 'employer' 
      }, metadata)
    );

    return {
      success: result.success,
      message: result.message,
      isOnboarded: result.is_onboarded
    };
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
    const response = await firstValueFrom(
      this.profileService.ListSkills({}, metadata)
    );
    // En gRPC, las listas suelen venir dentro de una propiedad (ej: response.skills)
    return response.skills || [];
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
