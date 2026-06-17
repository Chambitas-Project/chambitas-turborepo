import { useState, useEffect } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Badge } from "@chambitas/ui";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EmployerStatsCards } from "../widgets/dashboard/ui/EmployerStatsCards";
import { employerApi } from "../api/employer.api";
import type { EmployerStats, EmployerProject, ActivityItemData } from "../api/employer.api";
import { ProjectListItem } from "../components/organisms/ProjectListItem";
import { RecentActivityCard } from "../components/organisms/RecentActivityCard";
import { CompleteProfileCard } from "../components/organisms/CompleteProfileCard";
import { ReviewsList } from "../components/organisms/ReviewsList";
import { ProfileModal } from "../components/organisms/ProfileModal";
import { useAuth } from "../context/AuthContext";

export function EmployerDashboard() {
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [projects, setProjects] = useState<EmployerProject[]>([]);
  const [activities, setActivities] = useState<ActivityItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [projectsData, activitiesData] = await Promise.all([
          employerApi.getRecentProjects(),
          employerApi.getRecentActivity()
        ]);
        
        const validProjects = Array.isArray(projectsData) ? projectsData : [];
        
        // Obtener aplicaciones para cada proyecto para sacar estadísticas reales
        const applicationsData = await Promise.all(
          validProjects.map(async (p) => {
            const apps = await employerApi.getProjectApplicants(p.id);
            return { projectId: p.id, apps };
          })
        );
        
        // Actualizar proyectos con contador real
        const projectsWithCounts = validProjects.map(p => {
           const projApps = applicationsData.find(a => a.projectId === p.id)?.apps || [];
           return { ...p, applicantCount: projApps.length, applicantsCount: projApps.length };
        });

        // Calcular estadísticas dinámicas
        const activeJobs = validProjects.filter(p => p.status === 'open' || p.status === 'active').length;
        const allApps = applicationsData.flatMap(a => a.apps);
        const newApplicants = allApps.filter(a => a.status === 'pending').length;
        const pendingReviews = validProjects.filter(p => p.status === 'completed' || p.status === 'closed').length; // Proyectos finalizados

        setStats({
          activeJobs,
          activeJobsTrend: 'Proyectos en curso',
          newApplicants,
          newApplicantsTrend: 'Postulantes pendientes',
          pendingReviews,
          pendingReviewsTrend: 'Proyectos finalizados'
        });

        setProjects(projectsWithCounts);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Panel del Empleador</h1>
          <p className="text-slate-500 font-medium">Bienvenido de nuevo, esto es lo que está pasando con tus microtrabajos hoy.</p>
        </div>
      </div>

      {/* Perfil del Empleador */}
      <div className="bg-white rounded-md p-6 border border-slate-100 shadow-sm mb-12 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="h-20 w-20 bg-slate-900 rounded-md flex items-center justify-center shrink-0">
           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${(user as any)?.companyName || (user as any)?.commercialName || (user as any)?.fullName || 'E'}&backgroundColor=0f172a`} alt="Avatar" className="rounded-md" />
        </div>
        <div className="space-y-2 flex-1 w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900">{(user as any)?.commercialName || (user as any)?.fullName || 'Usuario Anónimo'}</h2>
            <Badge className="bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 text-[10px] flex items-center gap-1 rounded-md shadow-none border-none">
              <CheckCircle2 className="h-3 w-3" /> VERIFICADO
            </Badge>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{(user as any)?.companyName || 'Empleador Confidencial'}</p>
          <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-3xl line-clamp-2">
            {(user as any)?.description || 'Aún no has agregado una descripción a tu perfil. Completa tu perfil para atraer a los mejores talentos a tus proyectos.'}
          </p>
        </div>
        <Button onClick={() => setIsProfileModalOpen(true)} variant="outline" className="shrink-0 rounded-md font-bold text-slate-700 border-slate-200 hover:bg-slate-50 shadow-none w-full md:w-auto">
          Editar Perfil
        </Button>
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

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
