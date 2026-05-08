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
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { 
  CreateStudentProfileDto, 
  UpdateStudentProfileDto, 
  CreateEmployerProfileDto, 
  UpdateEmployerProfileDto 
} from './dto/profile.dto';
import { IProfileService } from '@chambitas/proto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { createGrpcMetadata } from '../auth/utils/grpc-metadata.util';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
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

  @Delete('me')
  @ApiOperation({ summary: 'Soft delete del perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil desactivado' })
  async deleteProfile(@Req() req: Request) {
    const user = (req as any).user;
    const metadata = createGrpcMetadata(user);
    return await firstValueFrom(
      this.profileService.DeleteProfile({ userId: user.id }, metadata)
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
