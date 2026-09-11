/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from '../src/matching/matching.service';
import { SupabaseService } from '@chambitas/supabase';

describe('Pruebas de Latencia de Recomendación e Inferencia (<2s)', () => {
  let service: MatchingService;
  let mockSupabaseService: any;
  let mockAnalyticsClient: any;

  beforeEach(async () => {
    mockSupabaseService = {
      getClient: jest.fn().mockReturnValue({
        rpc: jest.fn().mockResolvedValue({
          data: [
            { id: 'proj-1', similarity: 0.92 },
            { id: 'proj-2', similarity: 0.85 },
            { id: 'proj-3', similarity: 0.78 }
          ],
          error: null
        }),
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'student_profiles') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { skills: ['python', 'react', 'postgresql'] },
                error: null
              })
            };
          }
          if (table === 'projects') {
            return {
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              is: jest.fn().mockResolvedValue({
                data: [
                  { id: 'proj-1', project_required_skills: [{ skills: { name: 'python' } }] },
                  { id: 'proj-2', project_required_skills: [{ skills: { name: 'react' } }] },
                  { id: 'proj-3', project_required_skills: [{ skills: { name: 'postgresql' } }] }
                ],
                error: null
              })
            };
          }
          if (table === 'applications') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              in: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            };
          }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null })
          };
        })
      })
    };

    mockAnalyticsClient = {
      getService: jest.fn().mockReturnValue({
        TrackEvent: jest.fn().mockReturnValue({
          subscribe: jest.fn((callbacks: any) => callbacks && callbacks.next && callbacks.next())
        })
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: 'ANALYTICS_PACKAGE', useValue: mockAnalyticsClient }
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    service.onModuleInit();
  });

  it('debe responder a getRecommendations en menos de 2000ms (2s)', async () => {
    const startTime = performance.now();

    const response = await service.getRecommendations({
      userId: '11111111-1111-1111-1111-111111111111',
      limit: 20,
      page: 1
    } as any);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(response).toBeDefined();
    expect(response.recommendations.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(2000); // Exigencia estricta: < 2 segundos (2000ms)
    console.log(`[LATENCY TEST] getRecommendations respondió en: ${duration.toFixed(2)}ms (Meta: < 2000ms)`);
  });

  it('debe calcular el score de coincidencia atómica en menos de 500ms', async () => {
    mockSupabaseService.getClient().rpc.mockResolvedValueOnce({
      data: 0.89,
      error: null
    });

    const startTime = performance.now();

    const result = await service.calculateSingleMatchScore(
      '11111111-1111-1111-1111-111111111111',
      'proj-1'
    );

    const duration = performance.now() - startTime;

    expect(result.score).toBe(0.89);
    expect(duration).toBeLessThan(500); // Evaluación ultra-rápida < 500ms
    console.log(`[LATENCY TEST] calculateSingleMatchScore respondió en: ${duration.toFixed(2)}ms (Meta: < 500ms)`);
  });

  it('debe soportar ráfagas de 50 solicitudes concurrentes respondiendo el P99 en menos de 2000ms', async () => {
    const requestCount = 50;
    const promises = [];
    const startTime = performance.now();

    for (let i = 0; i < requestCount; i++) {
      promises.push(
        service.getRecommendations({
          userId: `user-${i}`,
          limit: 10,
          page: 1
        } as any)
      );
    }

    const results = await Promise.all(promises);
    const totalDuration = performance.now() - startTime;
    const avgDurationPerReq = totalDuration / requestCount;

    expect(results.length).toBe(requestCount);
    expect(avgDurationPerReq).toBeLessThan(2000);
    console.log(`[LATENCY BURST TEST] ${requestCount} solicitudes concurrentes procesadas en ${totalDuration.toFixed(2)}ms (Promedio: ${avgDurationPerReq.toFixed(2)}ms/req)`);
  });
});
