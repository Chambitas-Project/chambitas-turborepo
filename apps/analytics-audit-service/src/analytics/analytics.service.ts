import { Injectable, Logger } from '@nestjs/common';
import { TrackEventRequest, TrackEventResponse, GetOverviewKPIsRequest, GetOverviewKPIsResponse } from '@chambitas/proto';
import { of, Observable, from } from 'rxjs';
import { SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  trackEvent(data: TrackEventRequest): Observable<TrackEventResponse> {
    this.logger.log(`Tracking event: ${data.eventType} from ${data.source}`);
    return of({ success: true });
  }

  getOverviewKPIs(data: GetOverviewKPIsRequest): Observable<GetOverviewKPIsResponse> {
    return from(this._getOverviewKPIs());
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
