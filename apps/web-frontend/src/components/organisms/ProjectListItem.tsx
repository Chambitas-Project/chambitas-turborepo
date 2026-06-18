import { Card, CardContent, Badge, cn } from "@chambitas/ui";
import { Clock, TrendingUp, Users } from "lucide-react";
import type { EmployerProject } from "../../api/employer.api";

function formatTimeAgo(dateString?: string) {
  if (!dateString) return 'hace poco';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'hace poco';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `hace ${diffInSeconds} s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `hace ${diffInDays} d`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `hace ${diffInMonths} meses`;
}

export function ProjectListItem({ project }: { project: EmployerProject }) {
  const isCompleted = project.status === 'completed' || project.status === 'closed';
  const isActive = project.status === 'active' || project.status === 'open';
  const isPending = project.status === 'pending' || project.status === 'draft';
  const isInProgress = project.status === 'in_progress';

  const timeAgoStr = formatTimeAgo(project.createdAt || (project as any).created_at);

  return (
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden group">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-3 flex-1 pr-4 sm:pr-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-lg text-slate-800">{project.title}</h3>
            <Badge className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-1",
              isActive ? "bg-emerald-100 text-emerald-700" :
              isInProgress ? "bg-indigo-100 text-indigo-700" :
              isPending ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-500"
            )}>
              {isActive ? 'ACTIVO' : isInProgress ? 'EN PROGRESO' : isPending ? 'PENDIENTE DE APROBACIÓN' : 'COMPLETADO'}
            </Badge>
          </div>
          
          {project.description && (
             <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
               {project.description}
             </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> 
              {isCompleted ? `Completado ${timeAgoStr}` : `Publicado ${timeAgoStr}`}
            </span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {project.budget ? `S/.${project.budget}` : 'Sin presupuesto'}</span>
            {isCompleted && project.contracted ? (
               <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Contratado: {project.contracted}</span>
            ) : (
               <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {project.applicantsCount || project.applicantCount || project.applicant_count || 0} Postulantes</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
