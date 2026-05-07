import { Controller, Get, Param, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IMatchingService } from '@chambitas/proto';
import { RecommendationsQueryDto } from './dto/recommendations-query.dto';

@ApiTags('Matching')
@Controller('matching')
export class MatchingController implements OnModuleInit {
  private matchingService!: IMatchingService;

  constructor(@Inject('MATCHING_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.matchingService = this.client.getService<IMatchingService>('MatchingService');
  }

  @Get('recommendations/:userId')
  @ApiOperation({ summary: 'Obtener recomendaciones de trabajos para un usuario' })
  getRecommendations(
    @Param('userId') userId: string, 
    @Query() query: RecommendationsQueryDto
  ) {
    return this.matchingService.GetRecommendations({ 
      userId, 
      limit: query.limit || 10 
    });
  }
}
