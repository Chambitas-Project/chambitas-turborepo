import { Controller, Get, Query, Inject, OnModuleInit, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IMatchingService } from '@chambitas/proto';
import { CurrentUser } from '@chambitas/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsQueryDto } from './dto/recommendations-query.dto';

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
    // Asegurarnos de obtener solo el ID string
    const userId = typeof user === 'string' ? user : user.id;
    
    return this.matchingService.GetRecommendations({ 
      userId, 
      limit: query.limit || 10 
    });
  }
}
