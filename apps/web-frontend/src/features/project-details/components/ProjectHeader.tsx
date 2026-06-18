import { Clock, Zap } from "lucide-react";
import { Badge, cn } from "@chambitas/ui";
import type { Project } from "../types";

interface ProjectHeaderProps {
  project: Project;
  timeAgo: string;
  matchScore?: number;
}

export function ProjectHeader({ project, timeAgo, matchScore }: ProjectHeaderProps) {
  return (
    <div className="p-6 md:p-10 lg:pl-16 space-y-8 border-b border-slate-50">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3 text-emerald-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Publicado {timeAgo}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {project.title}
          </h1>

          {matchScore !== undefined && matchScore > 0 && (
            <div className="flex items-center mt-2">
              <Badge className="bg-emerald-100 text-emerald-700 font-black px-3 py-1 text-xs flex items-center gap-1.5 rounded-md">
                <Zap className="h-3.5 w-3.5" /> MATCH {(matchScore * 100).toFixed(0)}%
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-8 shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presupuesto Estimado</p>
            <p className="text-3xl font-black text-slate-900">S/.{project.budget}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Precio por proyecto</p>
          </div>
          <div className="h-14 w-px bg-slate-100 hidden sm:block" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
            <div className="flex items-center gap-2 pt-1">
              <div className={cn(
                "h-3 w-3 rounded-full animate-pulse",
                (project.status === 'active' || project.status === 'open') ? "bg-emerald-500" :
                  project.status === 'in_progress' ? "bg-indigo-500" :
                    "bg-slate-400"
              )} />
              <p className="text-base font-black text-slate-900 uppercase">
                {(project.status === 'active' || project.status === 'open') ? 'Abierto' :
                  project.status === 'in_progress' ? 'En Progreso' :
                    project.status === 'pending' ? 'Pendiente' : 'Completado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar para Proyectos en Progreso */}
      {project.status === 'in_progress' && (
        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" /> Tiempo del Proyecto
            </h3>
            <span className="text-xs font-bold text-slate-500">En ejecución</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/2 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
