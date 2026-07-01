import { useState, useEffect } from "react";
import { Plus, Search, Filter, FileText } from "lucide-react";
import { Button, Input } from "@chambitas/ui";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import { apiClient } from "../api/api-client";
import type { EmployerProject } from "../api/employer.api";
import { ProjectListItem } from "../components/organisms/ProjectListItem";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

export function EmployerProjectsPage() {
  const [projects, setProjects] = useState<EmployerProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteModalProjectId, setDeleteModalProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const projectsData = await employerApi.getRecentProjects();
        const validProjects = Array.isArray(projectsData) ? projectsData : [];
        
        // Ordenar por cantidad de postulantes (descendente) y luego por fecha (descendente)
        validProjects.sort((a, b) => {
          const appsA = a.applicantsCount || a.applicantCount || (a as any).applicant_count || 0;
          const appsB = b.applicantsCount || b.applicantCount || (b as any).applicant_count || 0;
          
          if (appsA !== appsB) {
            return appsB - appsA;
          }
          
          const dateA = new Date(a.createdAt || (a as any).created_at || 0).getTime();
          const dateB = new Date(b.createdAt || (b as any).created_at || 0).getTime();
          return dateB - dateA;
        });

        setProjects(validProjects);
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!deleteModalProjectId) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/marketplace/projects/${deleteModalProjectId}`);
      setProjects(projects.filter(p => p.id !== deleteModalProjectId));
      setDeleteModalProjectId(null);
    } catch (error) {
      console.error("Error deleting project", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
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
              <div key={project.id} className="relative">
                <div onClick={() => navigate(`/employer/projects/${project.id}`)} className="cursor-pointer">
                  <ProjectListItem project={project} />
                </div>

                <div className="absolute top-4 right-4 z-10 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === project.id ? null : project.id);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {menuOpenId === project.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden z-20">
                      {project.status !== 'closed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            navigate(`/employer/projects/${project.id}/edit`);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" /> Editar
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          setDeleteModalProjectId(project.id);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Modal de Eliminar (Estilo "Soft") */}
      {deleteModalProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900">¿Eliminar publicación?</h3>
              <p className="text-slate-500 font-medium text-sm">
                Esta acción no se puede deshacer. Todos los datos y postulaciones asociados a este proyecto se perderán.
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteModalProjectId(null)}
                className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 font-bold rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl border-none shadow-none"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
