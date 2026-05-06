import { Controller, Patch, Body, Inject, OnModuleInit, Req, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { UpdateStudentProfileDto, UpdateEmployerProfileDto } from './dto/profile.dto';
// Assuming JwtAuthGuard is globally applied or explicitly applied via @UseGuards
// If it's globally applied via APP_GUARD, we don't need to import it here.

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile')
export class ProfileController implements OnModuleInit {
  private profileService: any;

  constructor(@Inject('PROFILE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.profileService = this.client.getService('ProfileService');
  }

  @Patch('student')
  @ApiOperation({ summary: 'Actualizar perfil base de Estudiante' })
  @ApiBody({ type: UpdateStudentProfileDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente', schema: { example: { isOnboarded: true } } })
  async updateStudentProfile(@Body() dto: UpdateStudentProfileDto, @Req() req: Request) {
    const user = (req as any).user;
    const userId = user?.id;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const requestPayload = {
      ...dto,
      userId,
    };

    const response: any = await firstValueFrom(
      this.profileService.UpdateStudentProfile(requestPayload)
    );
    return response;
  }

  @Patch('employer')
  @ApiOperation({ summary: 'Actualizar perfil base de Empleador' })
  @ApiBody({ type: UpdateEmployerProfileDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente', schema: { example: { isOnboarded: true } } })
  async updateEmployerProfile(@Body() dto: UpdateEmployerProfileDto, @Req() req: Request) {
    const user = (req as any).user;
    const userId = user?.id;

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const requestPayload = {
      ...dto,
      userId,
    };

    const response: any = await firstValueFrom(
      this.profileService.UpdateEmployerProfile(requestPayload)
    );
    return response;
  }
}
