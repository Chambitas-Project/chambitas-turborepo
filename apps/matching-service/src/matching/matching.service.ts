import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { GetRecommendationsRequest, GetRecommendationsResponse } from '@chambitas/proto';
import { SupabaseService } from '@chambitas/supabase';
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
      const { data: student, error: stError } = await this.supabase.getClient()
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
        .single() as any;

      if (stError || !student) {
        this.logger.error(`Error al obtener perfil del estudiante: ${stError?.message}`);
        return { recommendations: [] };
      }

      // 1.5 Calcular horas disponibles desde el bitmap (Cada '1' es media hora usualmente)
      const availability = student.availability_blocks || {};
      const totalBits = Object.values(availability).reduce((acc: number, dayBits: any) => {
        return acc + (dayBits.toString().split('1').length - 1);
      }, 0);
      const hoursAvailable = totalBits * 0.5;

      // 2. Obtener Proyectos candidatos
      const { data: projects, error: prError } = await this.supabase.getClient()
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
        .limit(20) as any;

      if (prError || !projects) {
        this.logger.error(`Error al obtener proyectos: ${prError?.message}`);
        return { recommendations: [] };
      }

      // 3. Loop de Inferencia Stateless (Cerebro IA)
      const recommendations = await Promise.all(
        (projects as any[]).map(async (project) => {
          try {
            const predictResponse = await firstValueFrom(
              this.mlEngineService.predictMatch({
                student: {
                  id: student.id,
                  career: student.careers?.name || 'Unknown',
                  ciclo: student.academic_cycle,
                  gpa: student.gpa,
                  isGpaVerified: student.is_gpa_verified,
                  hoursAvailable: hoursAvailable,
                  availabilityJson: JSON.stringify(student.availability_blocks),
                  hSkills: (student.student_skills as any[])
                    .filter(s => s.skills.type === 'hard')
                    .map(s => s.skills.name).join(', '),
                  sSkills: (student.student_skills as any[])
                    .filter(s => s.skills.type === 'soft')
                    .map(s => s.skills.name).join(', '),
                },
                project: {
                  id: project.id,
                  title: project.title,
                  category: project.service_category,
                  maxHours: project.max_hours_week,
                  scheduleJson: JSON.stringify(project.schedule_constraints),
                  reqJson: JSON.stringify(project.project_required_skills),
                  reqHSkills: (project.project_required_skills as any[])
                    .map(s => s.skills.name).join(', '),
                  complexity: 'Media', // Default ya que no está en DB
                },
              })
            );

            return {
              jobId: project.id,
              score: predictResponse.score,
              reason: `Similitud del ${(predictResponse.score * 100).toFixed(0)}% basada en tu perfil de ${student.careers?.name}`,
              aiMetadata: JSON.stringify({
                cluster: predictResponse.cluster,
                skillMatch: predictResponse.skillMatchRatio,
                mandatoryOk: predictResponse.mandatoryMatch
              })
            };
          } catch (err: any) {
            this.logger.warn(`Fallo en predicción para proyecto ${project.id}: ${err.message}`);
            return null;
          }
        })
      );

      // 4. Ranking Final
      const sortedRecommendations = recommendations
        .filter((r): r is any => r !== null)
        .sort((a, b) => b.score - a.score);

      return { recommendations: sortedRecommendations };

    } catch (error: any) {
      this.logger.error(`Fallo crítico en el orquestador de matching: ${error.message}`);
      return { recommendations: [] };
    }
  }
}
