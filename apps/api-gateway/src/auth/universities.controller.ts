import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { IAuthService, UniversityListResponse, UniversityResponse } from '@chambitas/proto';
import { Public } from './decorators/public.decorator';

@ApiTags('Universities')
@Controller('universities')
export class UniversitiesController implements OnModuleInit {
  private authService!: IAuthService;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<IAuthService>('AuthService');
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todas las universidades activas' })
  @ApiResponse({ status: 200, description: 'Lista de universidades' })
  async listUniversities(): Promise<UniversityListResponse> {
    return await firstValueFrom(this.authService.ListUniversities({}));
  }
}
