/// <reference types="jest" />
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));
import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryInterceptor } from '@chambitas/common';
import { of } from 'rxjs';

describe('Pruebas de Latencia del API Gateway e Interceptores (<2s)', () => {
  let interceptor: TelemetryInterceptor;
  let mockAnalyticsClient: any;

  beforeEach(async () => {
    mockAnalyticsClient = {
      getService: jest.fn().mockReturnValue({
        TrackEvent: jest.fn().mockReturnValue(of({ success: true }))
      })
    };

    interceptor = new TelemetryInterceptor(
      mockAnalyticsClient,
      'api-gateway'
    );
    interceptor.onModuleInit();
  });

  it('debe procesar e interceptar la solicitud midiendo la latencia en menos de 2000ms', (done: any) => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/api/v1/projects', method: 'GET' }),
        getResponse: () => ({ statusCode: 200 })
      })
    };

    const mockNext: any = {
      handle: () => of({ success: true, data: [] })
    };

    const startTime = performance.now();

    interceptor.intercept(mockContext, mockNext).subscribe({
      next: (val) => {
        const duration = performance.now() - startTime;
        expect(val).toBeDefined();
        expect(duration).toBeLessThan(2000);
        console.log(`[GATEWAY LATENCY TEST] Interceptor ejecutado en: ${duration.toFixed(2)}ms (Meta: < 2000ms)`);
        done();
      },
      error: (err) => done(err)
    });
  });
});
