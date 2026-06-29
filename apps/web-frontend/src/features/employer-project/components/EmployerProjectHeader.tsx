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

      {/* Progress Bar (Stepper) */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative px-2 sm:px-8">
          <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 hidden sm:block z-0" />
          
          {[
            { id: 'draft', label: 'Borrador', icon: '📝' },
            { id: 'open', label: 'Recibiendo Postulantes', icon: '📢' },
            { id: 'in_progress', label: 'En Ejecución', icon: '🚀' },
            { id: 'closed', label: 'Completado', icon: '✅' }
          ].map((step, index) => {
            const isCompleted = 
              project.status === 'closed' || 
              (project.status === 'in_progress' && index <= 2) ||
              (project.status === 'open' && index <= 1) ||
              (project.status === 'draft' && index === 0);
            const isCurrent = project.status === step.id;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white sm:px-2 mb-4 sm:mb-0 w-full sm:w-auto">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 transition-all",
                  isCurrent ? "border-indigo-500 bg-indigo-50 scale-110" :
                  isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white opacity-50 grayscale"
                )}>
                  {isCompleted && !isCurrent ? '✓' : step.icon}
                </div>
                <span className={cn(
                  "text-xs font-bold text-center",
                  isCurrent ? "text-indigo-600" : isCompleted ? "text-emerald-700" : "text-slate-400"
                )}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
