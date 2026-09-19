import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import { type Project } from "../types";

interface JobCardProps {
  project: Project;
  matchScore?: number;
  hasApplied?: boolean;
}

export function JobCard({ project, matchScore, hasApplied }: JobCardProps) {
  const navigate = useNavigate();
  const projectId = project.id || (project as any).project_id || (project as any)._id;

  const handleNavigate = () => {
    if (projectId) navigate(`/projects/${projectId}`);
  };

  const budget = project.budget || 0;
  const company = project.company_name || project.employer_name || "Empleador Confidencial";

  const statusText = project.status === 'active' || project.status === 'open' || !project.status ? 'Abierto' :
    project.status === 'in_progress' ? 'En Progreso' :
      project.status === 'pending' ? 'Pendiente' :
        project.status === 'completed' ? 'Completado' : 'Abierto';

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'hace poco';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'hace poco';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
  };

  const timeAgoText = formatTimeAgo(project.created_at);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(company);

  return (
    <div
      onClick={handleNavigate}
      className="bg-white rounded-[20px] p-6 border border-slate-200 hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex flex-col gap-5">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-100">
              {project.employer_avatar_url ? (
                <img 
                  src={project.employer_avatar_url} 
                  alt={company} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <span className="text-white font-bold text-lg tracking-wider">{initials}</span>
              )}
            </div>
            <div className="space-y-1 mt-0.5 min-w-0">
              <h4 className="text-[19px] font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
                {project.title}
              </h4>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Building2 className="h-4 w-4" />
                <span>{company}</span>
                <span>•</span>
                <span className={cn("font-bold", project.status === 'active' || project.status === 'open' || !project.status ? "text-emerald-600" : "text-slate-500")}>{statusText}</span>
                <span>•</span>
                <span>{timeAgoText}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
            {matchScore !== undefined && (
              <Badge className={cn(
                "font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-none border",
                matchScore > 0 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-rose-50 text-rose-600 border-rose-100"
              )}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {(Math.max(0, matchScore) * 100).toFixed(0)}% de Coincidencia
              </Badge>
            )}
            <p className="text-[22px] font-black text-slate-900">S/.{budget}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[15px] text-slate-500 font-medium leading-relaxed line-clamp-2">
          {project.description}
        </p>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap gap-2">
            {(project.skills || []).slice(0, 4).map((skill, idx) => {
              const skillName = typeof skill === "string" ? skill : skill.skill_name;
              return (
                <span key={idx} className="px-4 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium border border-slate-200">
                  {skillName}
                </span>
              );
            })}
          </div>
          {hasApplied ? (
            <span className="w-full sm:w-auto bg-slate-50 text-slate-600 font-bold px-6 h-11 flex items-center justify-center rounded-lg border border-slate-200 cursor-default">
              Postulado
            </span>
          ) : (
            <Button
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 h-11 rounded-lg shadow-sm hover:shadow-emerald-500/20 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
            >
              Postular ahora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] p-6 border border-slate-200 animate-pulse">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-64 bg-slate-200 rounded" />
              <div className="h-4 w-40 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-slate-200 rounded-lg" />
            <div className="h-8 w-20 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-11 w-32 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

