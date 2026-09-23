import { useState, useMemo } from "react";
import { Zap, Calendar, Sparkles, Clock, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { Project } from "../types";
import { DAYS, TIME_SLOTS } from "../../onboarding/types";
import { cn } from "@chambitas/ui";

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  const [showScheduleGrid, setShowScheduleGrid] = useState(false);

  // Normalizar el objeto schedule_constraints (en caso venga como JSON string o con claves en mayúsculas)
  const normalizedConstraints = useMemo(() => {
    if (!project.schedule_constraints) return null;
    let rawObj: Record<string, string> = {};

    if (typeof project.schedule_constraints === "string") {
      try {
        rawObj = JSON.parse(project.schedule_constraints);
      } catch (e) {
        return null;
      }
    } else {
      rawObj = project.schedule_constraints;
    }

    // Convertir todas las claves a mayúsculas para unificar (ej. "mon" -> "MON")
    const cleanObj: Record<string, string> = {};
    Object.entries(rawObj).forEach(([key, val]) => {
      cleanObj[key.toUpperCase()] = val;
    });

    return cleanObj;
  }, [project.schedule_constraints]);

  const isAsync = !normalizedConstraints || project.schedule_mode === "async";

  // Calcular horas totales requeridas a partir de los bloques '1' de la matriz
  const totalSelectedHours = useMemo(() => {
    if (!normalizedConstraints) return 0;
    let totalSlots = 0;
    Object.values(normalizedConstraints).forEach((dayStr) => {
      if (typeof dayStr === "string") {
        for (const char of dayStr) {
          if (char === "1") totalSlots++;
        }
      }
    });
    return totalSlots * 0.5;
  }, [normalizedConstraints]);

  return (
    <div className="p-6 md:p-10 lg:pl-16 space-y-12 pb-10">
      {/* Descripción */}
      <div className="max-w-4xl space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Sobre el Proyecto</h3>
        <p className="text-lg text-slate-600 leading-relaxed font-medium selection:bg-emerald-100">
          {project.description}
        </p>
      </div>

      {/* Habilidades Requeridas */}
      <div className="space-y-8">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Habilidades Requeridas</h3>
        <div className="flex flex-wrap gap-3">
          {project.skills.map((skill) => (
            <span
              key={skill.skill_id}
              className="px-4 py-2 rounded-md border border-slate-200 bg-transparent text-emerald-600 text-[11px] font-bold tracking-tight hover:scale-105 transition-transform cursor-default"
            >
              {skill.skill_name}
            </span>
          ))}
        </div>
      </div>

      {/* Horario y Disponibilidad Requerida */}
      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" /> Horario Requerido
        </h3>

        {isAsync ? (
          <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-900">100% Asincrónico / Horario Flexible</h4>
              <p className="text-xs font-medium text-emerald-700 mt-0.5">
                No requieres cumplir un horario fijo. Puedes avanzar en tus tareas según tu tiempo libre.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">Horario Específico Requerido</span>
                  {project.max_hours_week && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                      Max. {project.max_hours_week} hrs/semana
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {totalSelectedHours > 0
                    ? `El empleador requiere disponibilidad en ${totalSelectedHours} hrs semanales distribuidas en días específicos.`
                    : "Revisa la matriz de días y horas requeridas por el empleador."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowScheduleGrid(!showScheduleGrid)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>{showScheduleGrid ? "Ocultar Matriz" : "Ver Matriz de Horarios"}</span>
                {showScheduleGrid ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Matriz Desplegable de Horarios Requeridos */}
            {showScheduleGrid && (
              <div className="pt-3 border-t border-slate-200/60 animate-in fade-in zoom-in-98 duration-200">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                  <div className="min-w-125 space-y-2">
                    {/* Encabezado de Días */}
                    <div className="grid grid-cols-8 gap-1.5 text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase">Hora</div>
                      {DAYS.map((day) => (
                        <div
                          key={day.id}
                          className="py-1 px-1 rounded bg-slate-200 text-slate-700 text-[10px] font-black uppercase"
                        >
                          {day.label}
                        </div>
                      ))}
                    </div>

                    {/* Filas de Franjas Horarias */}
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                      {TIME_SLOTS.map((time, idx) => (
                        <div key={time} className="grid grid-cols-8 gap-1.5 items-center">
                          <div className="text-[10px] font-bold text-slate-400 text-right pr-1 shrink-0">
                            {time}
                          </div>
                          {DAYS.map((day) => {
                            const dayKey = day.id.toUpperCase();
                            const isRequired = normalizedConstraints?.[dayKey]?.[idx] === "1";
                            return (
                              <div
                                key={`${day.id}-${idx}`}
                                className={cn(
                                  "h-5 rounded transition-all flex items-center justify-center border",
                                  isRequired
                                    ? "bg-emerald-600 border-emerald-700 text-white shadow-xs"
                                    : "bg-white border-slate-100 opacity-30"
                                )}
                              >
                                {isRequired && <Check className="h-3 w-3 text-white" />}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info General */}
      <div className="flex flex-wrap gap-12 sm:gap-16 pt-8 border-t border-slate-100">
        <div className="space-y-4">
          <Zap className="h-6 w-6 text-amber-500" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel</p>
            <p className="text-base font-black">Estudiante</p>
          </div>
        </div>
        <div className="space-y-4">
          <Clock className="h-6 w-6 text-emerald-500" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dedicación</p>
            <p className="text-base font-black">
              {project.max_hours_week ? `${project.max_hours_week} hrs / sem` : "Flexible"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

