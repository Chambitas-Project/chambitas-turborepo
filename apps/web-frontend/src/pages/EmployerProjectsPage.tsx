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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
            className="bg-[#065f46] hover:bg-[#064e3b] text-white font-black h-12 px-6 rounded-md shadow-none cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2 border-2 border-white/50 rounded-full" /> Nuevo Microtrabajo
          </Button>
        </div>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
          <Input 
            placeholder="Buscar por título del puesto..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-white border border-slate-200 rounded-md text-base font-medium focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="relative shrink-0">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-14 pl-11 pr-10 w-full sm:w-auto rounded-md border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 appearance-none focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer shadow-sm transition-colors"
          >
            <option value="all" className="bg-white text-slate-700 font-medium py-2">Todos los estados</option>
            <option value="open" className="bg-white text-slate-700 font-medium py-2">Activos</option>
            <option value="draft" className="bg-white text-slate-700 font-medium py-2">Borradores</option>
            <option value="in_progress" className="bg-white text-slate-700 font-medium py-2">En Progreso</option>
            <option value="closed" className="bg-white text-slate-700 font-medium py-2">Cerrados</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Cargando publicaciones...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Aún no tienes publicaciones</h3>
            <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto">Cuando publiques nuevos microtrabajos, aparecerán aquí para que puedas gestionarlos y revisar a los postulantes.</p>
          </div>
        ) : (
          projects
            .filter(project => {
              const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = statusFilter === "all" || project.status === statusFilter;
              return matchesSearch && matchesStatus;
            })
            .map(project => (
              <div key={project.id} onClick={() => navigate(`/employer/projects/${project.id}`)} className="cursor-pointer relative group">
                <ProjectListItem project={project} />
                {project.status !== 'closed' && (
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employer/projects/${project.id}/edit`);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-4 bg-white hover:bg-slate-50 text-slate-600 font-bold px-4 h-9 rounded-md border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                  >
                    Editar
                  </Button>
                )}
              </div>
            ))
        )}
      </div>
    </DashboardLayout>
  );
}
