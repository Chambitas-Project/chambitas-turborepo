import { Controller, Post, Get, Body, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IMarketplaceService } from '@chambitas/proto';
import { CreateJobDto } from './dto/create-job.dto';
import { GetJobsQueryDto } from './dto/get-jobs-query.dto';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController implements OnModuleInit {
  private marketplaceService!: IMarketplaceService;

  constructor(@Inject('MARKETPLACE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.marketplaceService = this.client.getService<IMarketplaceService>('MarketplaceService');
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Crear un nuevo puesto de trabajo' })
  createJob(@Body() data: CreateJobDto) {
    return this.marketplaceService.CreateJob(data);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Obtener lista de trabajos con filtros' })
  getJobs(@Query() query: GetJobsQueryDto) {
    return this.marketplaceService.GetJobs(query);
  }
}
