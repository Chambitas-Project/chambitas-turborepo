import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { GetRecommendationsRequest, GetRecommendationsResponse } from '@chambitas/proto';
import { SupabaseService, Database } from '@chambitas/supabase';
import { Observable, firstValueFrom } from 'rxjs';
import { MLEngineServiceClient, PredictMatchResponse } from './ml-engine.interface';

@Injectable()
export class MatchingService implements OnModuleInit {
  private readonly logger = new Logger(MatchingService.name);
  private mlEngineService!: MLEngineServiceClient;

  constructor(
    @Inject('ML_ENGINE_PACKAGE') private client: ClientGrpc,
    private readonly supabase: SupabaseService,
  ) {}

  onModuleInit() {
    this.mlEngineService = this.client.getService<MLEngineServiceClient>('MLEngineService');
  }

  async getRecommendations(data: GetRecommendationsRequest): Promise<GetRecommendationsResponse> {
    const { userId } = data;
    this.logger.log(`Generando recomendaciones IA para el usuario: ${userId}`);

    try {
      // 1. Obtener datos del Estudiante (Capa de Negocio)
      const { data: student, error: stError } = await this.supabase.getClient<Database>()
        .from('student_profiles')
        .select(`
          id,
          gpa,
          academic_cycle,
          is_gpa_verified,
          availability_blocks,
          universities(name),
          careers(name),
          student_skills(proficiency_level, skills(id, name, type))
        `)
        .eq('id', userId)
        .single();

      if (stError || !student) {
        this.logger.error(`Error al obtener perfil del estudiante: ${stError?.message}`);
        return { recommendations: [] };
      }

      // 1.5 Calcular horas disponibles desde el bitmap
      const availability = (student.availability_blocks as any) || {};
      const totalBits = Object.values(availability).reduce((acc: number, dayBits: any) => {
        return acc + (dayBits.toString().split('1').length - 1);
      }, 0);
      const hoursAvailable = totalBits * 0.5;

      // 2. Obtener Proyectos candidatos
      const { data: projects, error: prError } = await this.supabase.getClient<Database>()
        .from('projects')
        .select(`
          id,
          title,
          service_category,
          max_hours_week,
          schedule_constraints,
          project_required_skills(min_proficiency, mandatory, skills(id, name))
        `)
        .eq('status', 'open')
        .limit(20);

      if (prError || !projects) {
        this.logger.error(`Error al obtener proyectos: ${prError?.message}`);
        return { recommendations: [] };
      }

      // 3. Inferencia por Lote (Optimizado para Rendimiento)
      const batchResponse = await firstValueFrom(
        this.mlEngineService.predictBatch({
          student: {
            id: student.id,
            career: (student.careers as any)?.name || 'Unknown',
            ciclo: student.academic_cycle || 0,
            gpa: student.gpa || 0,
            isGpaVerified: !!student.is_gpa_verified,
            hoursAvailable: hoursAvailable,
            availabilityJson: JSON.stringify(student.availability_blocks),
            hSkills: (student.student_skills as any[])
              .filter(s => s.skills.type === 'hard')
              .map(s => s.skills.name).join(', '),
            sSkills: (student.student_skills as any[])
              .filter(s => s.skills.type === 'soft')
              .map(s => s.skills.name).join(', '),
          },
          projects: projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            category: project.service_category,
            maxHours: project.max_hours_week || 0,
            scheduleJson: JSON.stringify(project.schedule_constraints),
            reqJson: JSON.stringify(project.project_required_skills),
            reqHSkills: (project.project_required_skills as any[])
              .map(s => s.skills.name).join(', '),
            complexity: 'Media',
          })),
        })
      );

      const recommendations = batchResponse.results.map((predictResponse, index) => {
        const project = projects[index];
        if (!project) return null;

        return {
          jobId: project.id,
          score: predictResponse.score,
          reason: `Similitud del ${(predictResponse.score * 100).toFixed(0)}% basada en tu perfil de ${(student.careers as any)?.name}`,
          aiMetadata: JSON.stringify({
            cluster: predictResponse.cluster,
            skillMatch: predictResponse.skillMatchRatio,
            mandatoryOk: predictResponse.mandatoryMatch
          })
        };
      })
      .filter((r): r is any => r !== null && r.score >= 0.5); // <--- FILTRO DE RELEVANCIA (50%)

      // 4. Persistencia en DB (Auditoría y Trazabilidad)
      const { data: activeModel } = await this.supabase.getClient<Database>()
        .from('ml_model_versions')
        .select('id')
        .eq('active', true)
        .order('trained_at', { ascending: false })
        .limit(1)
        .single();

      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score);

      if (activeModel && sortedRecommendations.length > 0) {
        const matchesToInsert = sortedRecommendations.map(r => ({
          student_id: student.id,
          project_id: r.jobId,
          model_version_id: activeModel.id,
          score: r.score,
          feature_vector: JSON.parse(r.aiMetadata),
          status: 'pending' as any,
          created_at: new Date().toISOString()
        }));

        // Guardamos con upsert para evitar duplicados y ahorrar espacio
        await this.supabase.getClient<Database>()
          .from('matches')
          .upsert(matchesToInsert, {
            onConflict: 'student_id, project_id, model_version_id'
          });
      }

      return { recommendations: sortedRecommendations };

    } catch (error: any) {
      this.logger.error(`Fallo crítico en el orquestador de matching: ${error.message}`);
      return { recommendations: [] };
    }
  }
}
