import { Clock } from "lucide-react";
import { cn } from "@chambitas/ui";
import type { EmployerProject } from "../types";

interface EmployerProjectHeaderProps {
  project: EmployerProject;
}

export function EmployerProjectHeader({ project }: EmployerProjectHeaderProps) {
  return (
    <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-slate-100 mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        <div className="space-y-4 max-w-3xl flex-1">
          <div className="flex items-center gap-3 text-emerald-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Publicado {project.createdAt || 'recientemente'}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-slate-900">
            {project.title}
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed font-medium mt-6">
            {project.description || "Sin descripción proporcionada."}
          </p>
        </div>

        <div className="flex flex-wrap gap-8 shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presupuesto Estimado</p>
            <p className="text-3xl font-black text-slate-900">{project.budget ? `S/.${project.budget}` : '--'}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Precio por proyecto</p>
          </div>
          <div className="h-14 w-px bg-slate-100 hidden sm:block" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
            <div className="flex items-center gap-2 pt-1">
              <div className={cn(
                "h-3 w-3 rounded-full animate-pulse",
                project.status === 'open' ? "bg-emerald-500" :
                  project.status === 'in_progress' ? "bg-indigo-500" :
                    "bg-slate-400"
              )} />
              <p className="text-base font-black text-slate-900 uppercase">
                {project.status === 'open' ? 'Activo' :
                  project.status === 'in_progress' ? 'En Progreso' :
                    project.status === 'draft' ? 'Borrador' : 'Completado'}
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
          <div className="h-3 w-full bg-slate-100 rounded-md overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/2 rounded-md relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
