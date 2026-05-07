import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IAnalyticsService, TrackEventRequest } from '@chambitas/proto';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController implements OnModuleInit {
  private analyticsService!: IAnalyticsService;

  constructor(@Inject('ANALYTICS_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.analyticsService = this.client.getService<IAnalyticsService>('AnalyticsService');
  }

  @Post('track')
  @ApiOperation({ summary: 'Registrar un evento de analítica' })
  trackEvent(@Body() data: TrackEventDto) {
    const grpcData: TrackEventRequest = {
      ...data,
      payloadJson: JSON.stringify(data.payload),
      timestamp: new Date().toISOString(),
    };
    return this.analyticsService.TrackEvent(grpcData);
  }
}
