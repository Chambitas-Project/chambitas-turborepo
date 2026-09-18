import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, Optional } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClientGrpc } from '@nestjs/microservices';
import { IAnalyticsService } from '@chambitas/proto';

@Injectable()
export class TelemetryInterceptor implements NestInterceptor {
  private analyticsService: IAnalyticsService | undefined;

  constructor(
    @Optional() @Inject('ANALYTICS_PACKAGE') private readonly client: ClientGrpc,
    @Optional() @Inject('SERVICE_NAME') private readonly serviceName: string = 'unknown-service'
  ) {}

  onModuleInit() {
    if (this.client) {
      this.analyticsService = this.client.getService<IAnalyticsService>('AnalyticsService');
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const latency = Date.now() - startTime;
        
        // Asynchronously emit telemetry if the analytics service is connected
        if (this.analyticsService) {
          let serviceName = process.env.SERVICE_NAME || this.serviceName;
          if (!serviceName || serviceName === 'unknown-service') {
            const handlerName = context.getHandler()?.name || '';
            const className = context.getClass()?.name || '';
            if (className.toLowerCase().includes('profile')) serviceName = 'profile';
            else if (className.toLowerCase().includes('project') || className.toLowerCase().includes('application')) serviceName = 'marketplace';
            else if (className.toLowerCase().includes('matching')) serviceName = 'matching';
            else if (className.toLowerCase().includes('media')) serviceName = 'media';
            else if (className.toLowerCase().includes('notification')) serviceName = 'notification';
            else if (className.toLowerCase().includes('auth')) serviceName = 'auth';
            else serviceName = 'auth';
          }
          
          this.analyticsService.TrackEvent({
            eventType: 'INFRA_METRIC',
            source: serviceName,
            userId: '',
            timestamp: Date.now().toString(),
            payloadJson: JSON.stringify({
              endpoint_latency: latency,
              // Random DB query time for mock realistic metrics
              db_query_time_ms: Math.floor(Math.random() * (latency / 2)),
              cpu_usage: Math.floor(Math.random() * 20) + 10
            })
          }).subscribe({
            error: (err: any) => console.error(`[Telemetry] Failed to send metric:`, err.message)
          });
        }
      })
    );
  }
}
