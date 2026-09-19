import { useState, useEffect } from "react";
import { Search, FileText, LayoutGrid, List as ListIcon, Clock, Users, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button, Input, cn } from "@chambitas/ui";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import { apiClient } from "../api/api-client";
import type { EmployerProject } from "../api/employer.api";
import { ProjectListItem } from "../components/organisms/ProjectListItem";
import { PiononoLoader } from "../components/atoms/PiononoLoader";

function formatTimeAgo(dateString?: string) {
  if (!dateString) return 'hace poco';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'hace poco';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `hace unos segundos`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `hace ${diffInDays} d`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `hace ${diffInMonths} m`;
}

type ViewMode = 'board' | 'list';

export function EmployerProjectsPage() {
  const [projects, setProjects] = useState<EmployerProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
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

        validProjects.sort((a, b) => {
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

  const statusPriority: Record<string, number> = {
    active: 1,
    open: 1,
    in_progress: 2,
    pending: 3,
    draft: 3,
    completed: 4,
    closed: 4,
  };

  const filteredProjects = [...projects]
    .filter(project => project.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const prioA = statusPriority[a.status] || 5;
      const prioB = statusPriority[b.status] || 5;
      if (prioA !== prioB) return prioA - prioB;
      const dateA = new Date(a.createdAt || (a as any).created_at || 0).getTime();
      const dateB = new Date(b.createdAt || (b as any).created_at || 0).getTime();
      return dateB - dateA;
    });

  // Grouping for CRM Columns
  const activeProjects = filteredProjects.filter(p => p.status === 'active' || p.status === 'open' || !p.status);
  const inProgressProjects = filteredProjects.filter(p => p.status === 'in_progress' || p.status === 'pending');
  const completedProjects = filteredProjects.filter(p => p.status === 'completed' || p.status === 'closed');

  const columns = [
    {
      id: 'active',
      title: 'Convocatorias Activas',
      color: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      projects: activeProjects,
    },
    {
      id: 'in_progress',
      title: 'En Desarrollo / Progreso',
      color: 'bg-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      projects: inProgressProjects,
    },
    {
      id: 'completed',
      title: 'Completados y Finalizados',
      color: 'bg-slate-400',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      projects: completedProjects,
    }
  ];

  const renderProjectCard = (project: EmployerProject) => {
    const applicantsCount = project.applicantsCount || project.applicantCount || (project as any).applicant_count || 0;
    const timeAgo = formatTimeAgo(project.createdAt || (project as any).created_at);

    return (
      <div
        key={project.id}
        onClick={() => navigate(`/employer/projects/${project.id}`)}
        className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2 pr-6">
            <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition-colors">
              {project.title}
            </h4>
          </div>
          {project.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {project.description}
            </p>
          )}
        </div>

        {/* Action Menu */}
        <div className="absolute top-4 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenId(menuOpenId === project.id ? null : project.id);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpenId === project.id && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-100 rounded-lg shadow-lg overflow-hidden z-20 text-xs">
              {project.status !== 'closed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(null);
                    navigate(`/employer/projects/${project.id}/edit`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Editar
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(null);
                  setDeleteModalProjectId(project.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 font-bold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-slate-900 font-extrabold text-sm">
            S/.{project.budget || 0}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3.5 w-3.5" /> {timeAgo}
            </span>
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px]",
              applicantsCount > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
            )}>
              <Users className="h-3 w-3" /> {applicantsCount}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="employer">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-1">Tablero de Publicaciones</h1>
          <p className="text-slate-500 font-medium">Pipeline visual para gestionar todas tus ofertas de microtrabajos.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Toggle View */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                "p-2 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === 'board' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-4 w-4" /> Tablero
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <ListIcon className="h-4 w-4" /> Lista
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="mb-6 flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
          <Input
            placeholder="Buscar por título del puesto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {isLoading ? (
        <PiononoLoader message="Cargando publicaciones..." className="py-20" />
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Aún no tienes publicaciones</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto text-sm">
            Cuando publiques nuevos microtrabajos, aparecerán en las columnas para gestionarlos cómodamente.
          </p>
        </div>
      ) : viewMode === 'board' ? (
        /* CRM Kanban Board View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-12">
          {columns.map(col => (
            <div key={col.id} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-4 min-h-125">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", col.color)} />
                  <h3 className="font-bold text-slate-800 text-sm">{col.title}</h3>
                </div>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-black border", col.badgeBg)}>
                  {col.projects.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex flex-col gap-3">
                {col.projects.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs font-medium text-slate-400">Sin publicaciones en este estado</p>
                  </div>
                ) : (
                  col.projects.map(project => renderProjectCard(project))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Classic List View */
        <div className="space-y-3 pb-12">
          {filteredProjects.map(project => (
            <div key={project.id} className="relative">
              <div onClick={() => navigate(`/employer/projects/${project.id}`)} className="cursor-pointer">
                <ProjectListItem project={project} />
              </div>
            </div>
          ))}
        </div>
      )}

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
