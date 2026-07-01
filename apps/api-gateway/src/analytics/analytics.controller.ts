import { Controller, Post, Get, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IAnalyticsService, TrackEventRequest } from '@chambitas/proto';
import { TrackEventDto } from './dto/track-event.dto';
import { firstValueFrom } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController implements OnModuleInit {
  private analyticsService!: IAnalyticsService;

  constructor(@Inject('ANALYTICS_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.analyticsService = this.client.getService<IAnalyticsService>('AnalyticsService');
  }

  @Public()
  @Post('track')
  @ApiOperation({ summary: 'Registrar un evento de analítica' })
  trackEvent(@Body() data: TrackEventDto) {
    const grpcData: TrackEventRequest = {
      ...data,
      userId: data.userId || 'anonymous',
      payloadJson: JSON.stringify(data.payload),
      timestamp: new Date().toISOString(),
    };
    return this.analyticsService.TrackEvent(grpcData);
  }

  @Public()
  @Get('overview')
  @ApiOperation({ summary: 'Obtener métricas y KPIs para el Dashboard de Analíticas' })
  async getOverview() {
    const response = await firstValueFrom(this.analyticsService.GetOverviewKPIs({}));
    
    return {
      activeStudents: response.activeStudents,
      totalProjects: response.totalProjects,
      totalApplications: response.totalApplications,
      totalIncomeGenerated: response.totalIncomeGenerated,
      avgTimeToHireDays: response.avgTimeToHireDays,
      funnelData: JSON.parse(response.funnelDataJson || '[]'),
      incomeProgress: JSON.parse(response.incomeProgressJson || '[]')
    };
  }

  @Public()
  @Get('ml-engine')
  @ApiOperation({ summary: 'Obtener métricas del motor de ML' })
  async getMLEngineKPIs() {
    const response = await firstValueFrom(this.analyticsService.GetMLEngineKPIs({}));
    
    return {
      modelVersions: JSON.parse(response.modelVersionsJson || '[]'),
      recommendationLogs: JSON.parse(response.recommendationLogsJson || '[]'),
      matchesDistribution: JSON.parse(response.matchesDistributionJson || '[]')
    };
  }

  @Public()
  @Get('infrastructure')
  @ApiOperation({ summary: 'Obtener métricas de infraestructura y seguridad' })
  async getInfrastructureKPIs() {
    const response = await firstValueFrom(this.analyticsService.GetInfrastructureKPIs({}));
    
    return {
      performanceMetrics: JSON.parse(response.performanceMetricsJson || '[]'),
      uxFunnel: JSON.parse(response.uxFunnelJson || '[]'),
      securityAlerts: JSON.parse(response.securityAlertsJson || '[]')
    };
  }
}
