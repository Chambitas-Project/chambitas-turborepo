import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EmployerStatsCards } from "../widgets/dashboard/ui/EmployerStatsCards";
import { employerApi } from "../api/employer.api";
import type { EmployerStats, EmployerProject, ActivityItemData } from "../api/employer.api";
import { ProjectListItem } from "../components/organisms/ProjectListItem";
import { RecentActivityCard } from "../components/organisms/RecentActivityCard";
import { CompleteProfileCard } from "../components/organisms/CompleteProfileCard";
import { ReviewsList } from "../components/organisms/ReviewsList";
import { useAuth } from "../context/AuthContext";

export function EmployerDashboard() {
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [projects, setProjects] = useState<EmployerProject[]>([]);
  const [activities, setActivities] = useState<ActivityItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsData, projectsData, activitiesData] = await Promise.all([
          employerApi.getStats(),
          employerApi.getRecentProjects(),
          employerApi.getRecentActivity()
        ]);
        
        // Mocking some initial values if the API returns empty (since there is no real backend yet for this)
        const isStatsValid = statsData && typeof statsData === 'object' && 'activeJobs' in statsData;
        setStats(isStatsValid && statsData.activeJobs !== 0 ? statsData : {
          activeJobs: 0,
          activeJobsTrend: 'Aún sin datos',
          newApplicants: 0,
          newApplicantsTrend: 'Aún sin datos',
          pendingReviews: 0,
          pendingReviewsTrend: 'Aún sin datos'
        });

        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);

      } catch {
        console.error("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout role="employer">
        <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Cargando panel...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer">
      {/* Header de Bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Panel del Empleador</h1>
          <p className="text-slate-500 font-medium">Bienvenido de nuevo, esto es lo que está pasando con tus microtrabajos hoy.</p>
        </div>
      </div>

      <EmployerStatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Listado de Publicaciones (8 col) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-slate-900">Publicaciones Recientes</h2>
            <button onClick={() => navigate('/employer/projects')} className="text-sm font-bold text-emerald-700 hover:underline cursor-pointer">Ver todas las publicaciones</button>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Aún no tienes publicaciones</h3>
                <p className="text-slate-500 font-medium mt-1">Crea tu primer microtrabajo para empezar.</p>
              </div>
            ) : (
              projects.slice(0, 3).map(project => (
                <ProjectListItem key={project.id} project={project} />
              ))
            )}
          </div>

          <div className="mt-8">
            {user?.id && <ReviewsList userId={user.id} role="employer" />}
          </div>
        </div>

        {/* Sidebar de Actividad (4 col) */}
        <div className="lg:col-span-4 space-y-6">
          <RecentActivityCard activities={activities} />
          <CompleteProfileCard />
        </div>

      </div>
    </DashboardLayout>
  );
}
