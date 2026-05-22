import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MatchingService } from './matching.service';
import { SupabaseService, Database } from '@chambitas/supabase';

@Processor('ml-scoring-queue')
export class ScoringProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoringProcessor.name);

  constructor(
    private readonly matchingService: MatchingService,
    private readonly supabase: SupabaseService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    if (job.name === 'calculate-score') {
      return this.handleCalculateScore(job);
    }
  }

  async handleCalculateScore(job: Job) {
    const { application_id, student_id, project_id } = job.data;
    this.logger.log(`Procesando postulación asíncrona: ${application_id} (Student: ${student_id}, Project: ${project_id})`);

    try {
      const { data: activeModel } = await this.supabase.getClient<Database>()
        .from('ml_model_versions')
        .select('id')
        .eq('active', true)
        .order('trained_at', { ascending: false })
        .limit(1)
        .single();

      if (!activeModel) {
        throw new Error('No hay modelo de ML activo');
      }

      const scoreResult = await this.matchingService.calculateSingleMatchScore(student_id, project_id);

      const insights = {
        strengths: scoreResult.strengths || [],
        weaknesses: scoreResult.weaknesses || [],
        aiMetadata: {
          cluster: scoreResult.cluster,
          skillMatchRatio: scoreResult.skillMatchRatio,
          mandatoryMatch: scoreResult.mandatoryMatch
        }
      };

      // Upsert en matches
      const { data: matchData, error: matchError } = await this.supabase.getClient<Database>()
        .from('matches')
        .upsert({
          student_id,
          project_id,
          model_version_id: activeModel.id,
          score: scoreResult.score,
          insights: insights as any, // json
          status: 'pending',
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id, project_id, model_version_id'
        })
        .select('id')
        .single();

      if (matchError || !matchData) {
        throw new Error(`Error insertando match: ${matchError?.message}`);
      }

      // Update en applications
      const { error: appError } = await this.supabase.getClient<Database>()
        .from('applications')
        .update({
          status: 'pending',
          match_id: matchData.id,
        })
        .eq('id', application_id);

      if (appError) {
        throw new Error(`Error actualizando postulación: ${appError.message}`);
      }

      this.logger.log(`Job completado. Score: ${(scoreResult.score * 100).toFixed(0)}%`);
      return scoreResult.score;

    } catch (error: any) {
      this.logger.error(`Error en ML scoring job: ${error.message}`);
      throw error; // Para que BullMQ aplique reintentos
    }
  }
}
