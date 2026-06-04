import { Card, CardContent, Badge, cn } from "@chambitas/ui";
import { Clock, TrendingUp, Users } from "lucide-react";
import type { EmployerProject } from "../../api/employer.api";

export function ProjectListItem({ project }: { project: EmployerProject }) {

  return (
    <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden group">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-3 flex-1 pr-4 sm:pr-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-lg text-slate-800">{project.title}</h3>
            <Badge className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-1",
              project.status === 'active' ? "bg-emerald-100 text-emerald-700" :
              project.status === 'pending' ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-500"
            )}>
              {project.status === 'active' ? 'ACTIVO' : project.status === 'pending' ? 'PENDIENTE DE APROBACIÓN' : 'COMPLETADO'}
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
              {project.status === 'completed' ? `Completado ${project.createdAt || 'hace poco'}` : `Publicado ${project.createdAt || 'hace poco'}`}
            </span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {project.budget ? `S/.${project.budget}` : 'Sin presupuesto'}</span>
            {project.status === 'completed' && project.contracted ? (
               <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Contratado: {project.contracted}</span>
            ) : (
               <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {project.applicantsCount || project.applicantCount || 0} Postulantes</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
