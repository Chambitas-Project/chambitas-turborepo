import { Controller, Get, Query, Inject, OnModuleInit, UseGuards, Patch, Param, Body } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IMatchingService } from '@chambitas/proto';
import { CurrentUser } from '@chambitas/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsQueryDto } from './dto/recommendations-query.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';

@ApiTags('Matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController implements OnModuleInit {
  private matchingService!: IMatchingService;

  constructor(@Inject('MATCHING_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.matchingService = this.client.getService<IMatchingService>('MatchingService');
  }

  @Get('recommendations/me')
  @ApiOperation({ summary: 'Obtener mis recomendaciones de proyectos personalizadas' })
  getRecommendations(
    @CurrentUser() user: any, 
    @Query() query: RecommendationsQueryDto
  ) {
    const userId = typeof user === 'string' ? user : user.id;
    
    return this.matchingService.GetRecommendations({ 
      userId, 
      limit: query.limit || 10 
    });
  }

  @Patch('matches/:id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una recomendación (feedback)' })
  updateMatchStatus(
    @Param('id') matchId: string,
    @Body() dto: UpdateMatchStatusDto,
    @CurrentUser() user: any
  ) {
    const userId = typeof user === 'string' ? user : user.id;

    return this.matchingService.UpdateMatchStatus({
      matchId,
      status: dto.status,
      userId
    });
  }
}
