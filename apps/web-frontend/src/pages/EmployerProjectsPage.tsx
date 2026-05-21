import { useState, useEffect } from "react";
import { Plus, Search, Filter, FileText } from "lucide-react";
import { Button, Input } from "@chambitas/ui";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import type { EmployerProject } from "../api/employer.api";
import { ProjectListItem } from "../components/organisms/ProjectListItem";

export function EmployerProjectsPage() {
  const [projects, setProjects] = useState<EmployerProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const projectsData = await employerApi.getRecentProjects();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <DashboardLayout role="employer">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Mis Publicaciones</h1>
          <p className="text-slate-500 font-medium">Gestiona y revisa todas tus ofertas de microtrabajos.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate("/employer/projects/new")}
            className="bg-[#065f46] hover:bg-[#064e3b] text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-emerald-900/10 cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2 border-2 border-white/50 rounded-full" /> Nuevo Microtrabajo
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Buscar por título del puesto..." 
            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl text-base font-medium focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 shrink-0">
          <Filter className="h-5 w-5 mr-2" /> Filtrar
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Cargando publicaciones...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Aún no tienes publicaciones</h3>
            <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto">Cuando publiques nuevos microtrabajos, aparecerán aquí para que puedas gestionarlos y revisar a los postulantes.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} onClick={() => navigate(`/employer/projects/${project.id}`)} className="cursor-pointer">
              <ProjectListItem project={project} />
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
