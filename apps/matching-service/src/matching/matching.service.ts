import { Injectable, Logger, InternalServerErrorException, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { SupabaseService, Database } from '@chambitas/supabase';
import {
  GetRecommendationsRequest,
  GetRecommendationsResponse,
  UpdateMatchStatusRequest,
  UpdateMatchStatusResponse,
  IAnalyticsService
} from '@chambitas/proto';

@Injectable()
export class MatchingService implements OnModuleInit {
  private readonly logger = new Logger(MatchingService.name);
  private analyticsService!: IAnalyticsService;

  constructor(
    private readonly supabase: SupabaseService,
    @Inject('ANALYTICS_PACKAGE') private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.analyticsService = this.client.getService<IAnalyticsService>('AnalyticsService');
  }

  async getRecommendations(data: GetRecommendationsRequest): Promise<GetRecommendationsResponse> {
    const { userId, limit = 20, page = 1 } = data as any;
    this.logger.log(`Consultando RPC pgvector híbrido para el usuario: ${userId}`);

    try {
      const startTime = Date.now();
      const { data: matches, error: rpcError } = await this.supabase.getClient<Database>()
        .rpc('match_projects_for_student' as any, {
          p_student_id: userId,
          match_threshold: 0.2,
          match_limit: limit,
          page_offset: (page - 1) * limit
        } as any);

      const duration = Date.now() - startTime;

      if (rpcError) {
        throw new InternalServerErrorException(`Fallo en RPC de Supabase: ${rpcError.message}`);
      }

      // Emit analytics event
      this.analyticsService.TrackEvent({
        eventType: 'RECOMMENDATION_LOG',
        source: 'matching-service',
        userId: userId,
        timestamp: Date.now().toString(),
        payloadJson: JSON.stringify({
          response_ms: duration,
          matchesCount: matches?.length || 0
        })
      }).subscribe({
        error: (err) => this.logger.error(`[Analytics] Failed to log recommendation latency`, err.message)
      });

      const finalRecommendations = (matches || []).map((m: any) => ({
        jobId: m.id,
        score: m.similarity,
        reason: `Compatibilidad híbrida del ${(m.similarity * 100).toFixed(0)}% (Habilidades + Horarios).`,
        aiMetadata: JSON.stringify({
          cluster: 0,
          skillMatch: m.similarity,
          mandatoryOk: true
        }),
        matchId: ''
      }));

      return { recommendations: finalRecommendations };

    } catch (error: any) {
      this.logger.error(`Fallo crítico en orquestador de matching RPC: ${error.message}`);
      return { recommendations: [] };
    }
  }

  // ========================================================================
  // 2. REFACTORIZACIÓN DE 'calculateSingleMatchScore' (Evaluación Atómica O(1))
  // ========================================================================
  async calculateSingleMatchScore(studentId: string, projectId: string): Promise<any> {
    this.logger.log(`Calculando score atómico nativo para estudiante ${studentId} y proyecto ${projectId}`);

    // Invocación de cálculo híbrido O(1) directo en disco.
    // Envía los UUIDs al RPC para que PostgreSQL extraiga los vectores, cruce horarios y calcule distancia.
    const { data: matchResult, error: rpcError } = await this.supabase.getClient<Database>()
      .rpc('evaluate_single_match' as any, {
        p_student_id: studentId,
        p_project_id: projectId
      } as any);

    if (rpcError || matchResult === null) {
      throw new Error(`Error calculando distancia matemática nativa: ${rpcError?.message}`);
    }

    const score = matchResult as unknown as number;

    // Mapeo dinámico basado en el score híbrido
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (score >= 0.8) {
      strengths.push('Excelente compatibilidad de horarios y habilidades');
    } else if (score >= 0.6) {
      strengths.push('Buena coincidencia técnica, revisa la disponibilidad de horas');
    } else {
      weaknesses.push('Baja compatibilidad híbrida. Evaluar cruce de horarios y skills.');
    }

    return {
      score: score,
      cluster: 0,
      skillMatchRatio: score,
      mandatoryMatch: true,
      strengths,
      weaknesses
    };
  }

  // ========================================================================
  // 3. OPTIMIZACIÓN DE 'updateMatchStatus' (Timestamps Seguros)
  // ========================================================================
  async updateMatchStatus(data: UpdateMatchStatusRequest): Promise<UpdateMatchStatusResponse> {
    const { matchId, status, userId } = data;

    const { data: match, error: updateError } = await this.supabase.getClient<Database>()
      .from('matches')
      .update({ status: status as any })
      .eq('id', matchId)
      .eq('student_id', userId)
      .select('project_id')
      .single();

    if (updateError || !match) {
      this.logger.error(`Error al actualizar estado del match ${matchId}: ${updateError?.message}`);
      return { success: false };
    }

    if (status === 'accepted') {
      const { error: appError } = await this.supabase.getClient<Database>()
        .from('applications')
        .upsert({
          student_id: userId,
          project_id: match.project_id,
          match_id: matchId,
          status: 'pending',
          cover_note: 'Postulación generada vía Recomendación IA'
          // 'applied_at' omitido intencionalmente para usar DEFAULT now() nativo
        }, {
          onConflict: 'student_id, project_id'
        });

      if (appError) {
        this.logger.error(`Error al crear postulación automática: ${appError.message}`);
      } else {
        this.logger.log(`Postulación oficial creada de forma segura para el estudiante ${userId}`);
      }
    }

    this.logger.log(`Match ${matchId} actualizado a estado: ${status}`);
    return { success: true };
  }
}
