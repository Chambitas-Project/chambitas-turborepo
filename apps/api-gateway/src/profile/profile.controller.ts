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

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile')
export class ProfileController implements OnModuleInit {
  private profileService!: IProfileService;

  constructor(@Inject('PROFILE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.profileService = this.client.getService<IProfileService>('ProfileService');
  }

  // --- Student Profiles ---

  @Post('student')
  @ApiOperation({ summary: 'Crear perfil de Estudiante' })
  @ApiBody({ type: CreateStudentProfileDto })
  @ApiResponse({ status: 201, description: 'Perfil creado exitosamente' })
  async createStudentProfile(@Body() dto: CreateStudentProfileDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return await firstValueFrom(
      this.profileService.CreateStudentProfile({ ...dto, userId })
    );
  }

  @Get(['student', 'student/:id'])
  @ApiOperation({ summary: 'Obtener perfil de Estudiante (por ID o el actual)' })
  @ApiParam({ name: 'id', required: false, description: 'ID de perfil o userId' })
  async getStudentProfile(@Req() req: Request, @Param('id') id?: string) {
    const targetId = id || (req as any).user.id;
    return await firstValueFrom(
      this.profileService.GetStudentProfile({ id: targetId })
    );
  }

  @Put('student')
  @ApiOperation({ summary: 'Actualización total de perfil de Estudiante' })
  @ApiBody({ type: UpdateStudentProfileDto })
  async updateStudentProfileFull(@Body() dto: UpdateStudentProfileDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return await firstValueFrom(
      this.profileService.UpdateStudentProfile({ ...dto, userId })
    );
  }

  @Patch('student')
  @ApiOperation({ summary: 'Actualización parcial de perfil de Estudiante' })
  @ApiBody({ type: UpdateStudentProfileDto })
  async updateStudentProfilePartial(@Body() dto: UpdateStudentProfileDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return await firstValueFrom(
      this.profileService.UpdateStudentProfile({ ...dto, userId })
    );
  }

  // --- Employer Profiles ---

  @Post('employer')
  @ApiOperation({ summary: 'Crear perfil de Empleador' })
  @ApiBody({ type: CreateEmployerProfileDto })
  @ApiResponse({ status: 201, description: 'Perfil creado exitosamente' })
  async createEmployerProfile(@Body() dto: CreateEmployerProfileDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return await firstValueFrom(
      this.profileService.CreateEmployerProfile({ ...dto, userId })
    );
  }

  @Get(['employer', 'employer/:id'])
  @ApiOperation({ summary: 'Obtener perfil de Empleador (por ID o el actual)' })
  @ApiParam({ name: 'id', required: false, description: 'ID de perfil o userId' })
  async getEmployerProfile(@Req() req: Request, @Param('id') id?: string) {
    const targetId = id || (req as any).user.id;
    return await firstValueFrom(
      this.profileService.GetEmployerProfile({ id: targetId })
    );
  }

  @Put('employer')
  @ApiOperation({ summary: 'Actualización total de perfil de Empleador' })
  @ApiBody({ type: UpdateEmployerProfileDto })
  async updateEmployerProfileFull(@Body() dto: UpdateEmployerProfileDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return await firstValueFrom(
      this.profileService.UpdateEmployerProfile({ ...dto, userId })
    );
  }

  @Patch('employer')
  @ApiOperation({ summary: 'Actualización parcial de perfil de Empleador' })
  @ApiBody({ type: UpdateEmployerProfileDto })
  async updateEmployerProfilePartial(@Body() dto: UpdateEmployerProfileDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    return await firstValueFrom(
      this.profileService.UpdateEmployerProfile({ ...dto, userId })
    );
  }

  // --- Common ---

  @Delete()
  @ApiOperation({ summary: 'Soft delete del perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil desactivado' })
  async deleteProfile(@Req() req: Request) {
    const userId = (req as any).user.id;
    return await firstValueFrom(
      this.profileService.DeleteProfile({ userId })
    );
  }
}
