import { Injectable, Logger } from '@nestjs/common';
import { TrackEventRequest, TrackEventResponse, GetOverviewKPIsRequest, GetOverviewKPIsResponse, GetMLEngineKPIsRequest, GetMLEngineKPIsResponse, GetInfrastructureKPIsRequest, GetInfrastructureKPIsResponse } from '@chambitas/proto';
import { of, Observable, from } from 'rxjs';
import { SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly supabase: SupabaseService) { }

  trackEvent(data: TrackEventRequest): Observable<TrackEventResponse> {
    return from(this._handleTrackEvent(data));
  }

  private async _handleTrackEvent(data: TrackEventRequest): Promise<TrackEventResponse> {
    this.logger.log(`Tracking event: ${data.eventType} from ${data.source}`);
    const client = this.supabase.getAdminClient<Database>();
    let payload: any = {};

    try {
      if (data.payloadJson) {
        payload = JSON.parse(data.payloadJson);
      }
    } catch (e) {
      this.logger.warn('Failed to parse payloadJson in trackEvent');
    }

    try {
      switch (data.eventType) {
        case 'SECURITY_ALERT':
          await client.from('security_audit_logs').insert({
            event_type: payload.event_type || 'regex_fail',
            severity: payload.severity || 'warning',
            metadata: { message: payload.message || 'Security Event', service: data.source },
            created_at: new Date().toISOString()
          });
          break;
        case 'RECOMMENDATION_LOG':
          await client.from('recommendation_logs').insert({
            response_ms: payload.response_ms || 0,
            model_version_id: payload.model_version_id || '00000000-0000-0000-0000-000000000000',
            student_id: payload.student_id || data.userId || '00000000-0000-0000-0000-000000000000'
          } as any);
          break;
        case 'UX_TELEMETRY':
          await client.from('ux_usability_telemetry').insert({
            event_type: payload.event_type || 'step_completed',
            flow_name: payload.flow_name || 'registration',
            step_name: payload.step_name || payload.step || 'Unknown',
            abandonment_rate: payload.abandonment_rate || 0,
            time_on_step_ms: payload.time_on_step_ms || 0,
            session_id: payload.session_id || 'unknown-session',
            recorded_at: new Date().toISOString()
          });
          break;
        case 'INFRA_METRIC':
          let microservice = data.source;
          if (!['auth', 'profile', 'analytics-audit', 'marketplace', 'matching', 'ml', 'notification'].includes(microservice)) {
            microservice = 'auth';
          }
          await client.from('infrastructure_performance_metrics').insert({
            microservice_name: microservice as any,
            latency_ms: payload.endpoint_latency || 0,
            db_query_time_ms: payload.db_query_time_ms || 0,
            cpu_usage_percent: payload.cpu_usage || 0,
            recorded_at: new Date().toISOString()
          });
          break;
        default:
          this.logger.log(`Event type ${data.eventType} not handled explicitly for Supabase insert`);
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Error saving event ${data.eventType} to Supabase:`, error);
      return { success: false };
    }
  }

  getOverviewKPIs(data: GetOverviewKPIsRequest): Observable<GetOverviewKPIsResponse> {
    return from(this._getOverviewKPIs());
  }

  getMLEngineKPIs(data: GetMLEngineKPIsRequest): Observable<GetMLEngineKPIsResponse> {
    return from(this._getMLEngineKPIs());
  }

  getInfrastructureKPIs(data: GetInfrastructureKPIsRequest): Observable<GetInfrastructureKPIsResponse> {
    return from(this._getInfrastructureKPIs());
  }

  private async _getMLEngineKPIs(): Promise<GetMLEngineKPIsResponse> {
    const client = this.supabase.getAdminClient<Database>();

    // ML Model Versions (Mock with fallback)
    const { data: modelVersions, error: err1 } = await client.from('ml_model_versions' as any).select('*').order('trained_at', { ascending: true });
    let modelVersionsJson = JSON.stringify(!err1 && modelVersions?.length ? modelVersions : [
      { version_tag: 'v1.0', f1_score: 0.72, precision_val: 0.75, recall_val: 0.70 },
      { version_tag: 'v1.1', f1_score: 0.78, precision_val: 0.81, recall_val: 0.76 },
      { version_tag: 'v1.2', f1_score: 0.85, precision_val: 0.88, recall_val: 0.82 },
      { version_tag: 'v2.0', f1_score: 0.92, precision_val: 0.94, recall_val: 0.90 }
    ]);

    // Recommendation Logs (Latencia)
    const { data: recLogs, error: err2 } = await client.from('recommendation_logs' as any).select('response_ms, created_at').limit(100);
    let recommendationLogsJson = JSON.stringify(!err2 && recLogs?.length ? recLogs : Array.from({ length: 20 }).map((_, i) => ({
      time: `10:${i < 10 ? '0' + i : i}`,
      response_ms: Math.floor(Math.random() * 50) + 100 // 100-150ms
    })));

    // Matches Distribution (Similitud)
    const { data: matches, error: err3 } = await client.from('matches' as any).select('similarity_score');
    let matchesDistributionJson = JSON.stringify(!err3 && matches?.length ? matches : [
      { range: '0-20%', count: 50 },
      { range: '21-40%', count: 120 },
      { range: '41-60%', count: 450 },
      { range: '61-80%', count: 890 },
      { range: '81-100%', count: 1240 }
    ]);

    return {
      modelVersionsJson,
      recommendationLogsJson,
      matchesDistributionJson
    };
  }

  private async _getInfrastructureKPIs(): Promise<GetInfrastructureKPIsResponse> {
    const client = this.supabase.getAdminClient<Database>();

    // Infra Metrics
    const { data: infraMetrics, error: err1 } = await client.from('infrastructure_performance_metrics' as any).select('*').limit(50);
    let performanceMetricsJson = JSON.stringify(!err1 && infraMetrics?.length ? infraMetrics : [
      { service: 'api-gateway', cpu_usage: 45, endpoint_latency: 120, db_query_time_ms: 15 },
      { service: 'auth-service', cpu_usage: 20, endpoint_latency: 45, db_query_time_ms: 25 },
      { service: 'matching-service', cpu_usage: 85, endpoint_latency: 350, db_query_time_ms: 80 },
      { service: 'profile-service', cpu_usage: 30, endpoint_latency: 80, db_query_time_ms: 30 }
    ]);

    // UX Telemetry
    const { data: uxLogs, error: err2 } = await client.from('ux_usability_telemetry' as any).select('*');
    let uxFunnelJson = JSON.stringify(!err2 && uxLogs?.length ? uxLogs : [
      { step: 'Landing', abandonment_rate: 10, time_on_step_ms: 5000 },
      { step: 'Registro', abandonment_rate: 45, time_on_step_ms: 45000 },
      { step: 'Onboarding', abandonment_rate: 20, time_on_step_ms: 120000 },
      { step: 'Dashboard', abandonment_rate: 5, time_on_step_ms: 300000 }
    ]);

    // Security Alerts
    const { data: alerts, error: err3 } = await client.from('security_audit_logs' as any).select('*').limit(10).order('created_at', { ascending: false });
    let securityAlertsJson = JSON.stringify(!err3 && alerts?.length ? alerts : [
      { id: 1, severity: 'HIGH', message: 'Múltiples intentos de login fallidos', service: 'auth-service', timestamp: new Date().toISOString() },
      { id: 2, severity: 'MEDIUM', message: 'Violación de política RLS prevenida', service: 'supabase-db', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, severity: 'LOW', message: 'Rotación de token JWT exitosa', service: 'auth-service', timestamp: new Date(Date.now() - 7200000).toISOString() }
    ]);

    return {
      performanceMetricsJson,
      uxFunnelJson,
      securityAlertsJson
    };
  }

  private async _getOverviewKPIs(): Promise<GetOverviewKPIsResponse> {
    const client = this.supabase.getAdminClient<Database>();

    // 1. Active Students
    const { count: activeStudents } = await client
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student');

    // 2. Total Projects
    const { count: totalProjects } = await client
      .from('projects')
      .select('id', { count: 'exact', head: true });

    // 3. Total Applications
    const { count: totalApplications } = await client
      .from('applications')
      .select('id', { count: 'exact', head: true });

    // 4. Income & Time to hire
    const { data: outcomes } = await client
      .from('employment_outcomes_tracking')
      .select('income_generated, time_to_hire_days');

    let totalIncomeGenerated = 0;
    let totalTime = 0;
    let hiredCount = 0;

    if (outcomes) {
      for (const o of outcomes) {
        if (o.income_generated) totalIncomeGenerated += o.income_generated;
        if (o.time_to_hire_days) {
          totalTime += o.time_to_hire_days;
          hiredCount++;
        }
      }
    }
    const avgTimeToHireDays = hiredCount > 0 ? totalTime / hiredCount : 0;

    // Funnel Data (mocked based on actual counts)
    const funnelData = [
      { step: 'Proyectos', value: totalProjects || 0 },
      { step: 'Postulaciones', value: totalApplications || 0 },
      { step: 'Contrataciones', value: hiredCount }
    ];

    // Income progress (mocking the last 6 months for the MVP curve)
    const incomeProgress = [
      { month: 'Ene', income: totalIncomeGenerated * 0.1 },
      { month: 'Feb', income: totalIncomeGenerated * 0.2 },
      { month: 'Mar', income: totalIncomeGenerated * 0.4 },
      { month: 'Abr', income: totalIncomeGenerated * 0.6 },
      { month: 'May', income: totalIncomeGenerated * 0.8 },
      { month: 'Jun', income: totalIncomeGenerated }
    ];

    return {
      activeStudents: activeStudents || 0,
      totalProjects: totalProjects || 0,
      totalApplications: totalApplications || 0,
      totalIncomeGenerated,
      avgTimeToHireDays,
      funnelDataJson: JSON.stringify(funnelData),
      incomeProgressJson: JSON.stringify(incomeProgress)
    };
  }
}
