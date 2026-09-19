import { Clock, FileEdit, Megaphone, Rocket, CheckSquare, Check, Edit2, DollarSign } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { useNavigate } from "react-router-dom";
import type { EmployerProject } from "../types";

interface EmployerProjectHeaderProps {
  project: EmployerProject;
}

export function EmployerProjectHeader({ project }: EmployerProjectHeaderProps) {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (project.status) {
      case 'open':
      case 'active':
        return { label: 'Activo', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'in_progress':
        return { label: 'En Progreso', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500 animate-pulse' };
      case 'draft':
        return { label: 'Borrador', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      default:
        return { label: 'Completado', bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 mb-6 space-y-4">
      {/* Top Main Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Title and Badges */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5",
              statusInfo.bg
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dot)} />
              {statusInfo.label}
            </span>

            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Publicado {project.createdAt || 'recientemente'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {project.title}
          </h1>

          {project.description && (
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">
              {project.description}
            </p>
          )}
        </div>

        {/* Action & Budget Bar */}
        <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-2.5 px-3.5 rounded-xl border border-slate-200/60 self-start md:self-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Presupuesto</p>
              <p className="text-base font-black text-slate-900 leading-tight">
                {project.budget ? `S/.${project.budget}` : '--'}
              </p>
            </div>
          </div>

          {project.status !== 'closed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/employer/projects/${project.id}/edit`)}
              className="flex items-center gap-1 border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs rounded-lg h-8 px-3 cursor-pointer shadow-xs ml-1"
            >
              <Edit2 className="h-3 w-3" /> Editar
            </Button>
          )}
        </div>
      </div>

      {/* Progress Line (Compact Stepper Grid) */}
      <div className="pt-3 border-t border-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'draft', label: 'Borrador', icon: FileEdit },
            { id: 'open', label: 'Recibiendo Postulantes', icon: Megaphone },
            { id: 'in_progress', label: 'En Ejecución', icon: Rocket },
            { id: 'closed', label: 'Completado', icon: CheckSquare }
          ].map((step, index) => {
            const isCompleted =
              project.status === 'closed' ||
              (project.status === 'in_progress' && index <= 2) ||
              (project.status === 'open' && index <= 1) ||
              (project.status === 'draft' && index === 0);
            const isCurrent = project.status === step.id;
            const IconComponent = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 p-2 px-3 rounded-xl border transition-all",
                  isCurrent ? "bg-emerald-50/80 border-emerald-300 text-emerald-800" :
                  isCompleted ? "bg-slate-50 border-slate-200/80 text-slate-700" : "bg-white border-slate-100 text-slate-400 opacity-50"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold",
                  isCurrent ? "bg-emerald-600 text-white" :
                  isCompleted ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {isCompleted && !isCurrent ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <IconComponent className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[11px] font-extrabold truncate">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
