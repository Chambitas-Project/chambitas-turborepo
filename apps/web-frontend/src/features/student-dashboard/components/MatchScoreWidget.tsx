import { useState } from "react";
import { Button } from "@chambitas/ui";
import { ChevronRight, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import type { Profile } from "../types";

interface MatchScoreWidgetProps {
  maxMatchScore: number | null;
  profile: Profile | null;
  strength: number;
}

export function MatchScoreWidget({ maxMatchScore, profile, strength }: MatchScoreWidgetProps) {
  const [showMissing, setShowMissing] = useState(false);

  const missingItems = [];
  const completedItems = [];

  if (profile?.bio) completedItems.push("Sobre mí");
  else missingItems.push("Sobre mí");

  if (profile?.gpa && profile.gpa > 0) completedItems.push("Promedio Ponderado");
  else missingItems.push("Promedio Ponderado");

  if (profile?.skills && profile.skills.length >= 3) completedItems.push("Al menos 3 habilidades");
  else missingItems.push("Al menos 3 habilidades");

  if (profile?.academicCycle && profile.academicCycle > 1) completedItems.push("Ciclo académico");
  else missingItems.push("Ciclo académico");
  return (
    <>
      {/* Match de Mercado */}
      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center md:text-left">
          Match de Mercado
        </h3>
        {maxMatchScore !== null && maxMatchScore > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1 w-full text-center md:text-left">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {maxMatchScore}%
                </span>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Nivel de Compatibilidad
                </p>
              </div>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-md overflow-hidden p-0.5">
              <div
                className="h-full bg-emerald-600 rounded-sm shadow-sm"
                style={{ width: `${maxMatchScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed text-center md:text-left px-4 md:px-0">
              Tu perfil es altamente demandado para micro-tareas de{" "}
              <span className="text-slate-900">{profile?.career}</span>.
            </p>
            <Button
              onClick={() => (window.location.href = "/jobs")}
              className="w-full bg-slate-900 hover:bg-black text-white rounded-md h-12 font-bold text-sm shadow-sm shadow-slate-200 transition-all"
            >
              Explorar Tareas
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400">Sin datos de coincidencia aún.</p>
              <p className="text-[10px] font-medium text-slate-500 mt-1">Sigue mejorando tu perfil.</p>
            </div>
            <Button
              onClick={() => (window.location.href = "/student/jobs")}
              variant="outline"
              className="w-full border-slate-200 text-slate-600 rounded-md h-12 font-bold text-sm transition-all hover:bg-slate-50"
            >
              Ver Catálogo
            </Button>
          </div>
        )}
      </div>

      {/* Nivel de Perfil (Fuerza) */}
      {strength < 100 && (
        <div className="pt-6">
          <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-xl space-y-6 text-center shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Nivel de Perfil
            </p>
            <div className="relative h-28 w-28 md:h-32 md:w-32 mx-auto">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="text-slate-50 stroke-current"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="text-emerald-500 stroke-current"
                  strokeWidth="2.5"
                  strokeDasharray={`${strength}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                  {strength}%
                </span>
                <span className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-tighter">
                  Fuerza
                </span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowMissing(!showMissing)}
                className="flex items-center justify-center w-full gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-all cursor-pointer"
              >
                VER QUÉ FALTA {showMissing ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {showMissing && (
                <div className="pt-4 text-left space-y-2 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Por completar:</p>
                  {missingItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Circle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}

                  {completedItems.length > 0 && (
                    <>
                      <div className="h-px w-full bg-slate-100 my-3" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Completado:</p>
                      {completedItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="line-through">{item}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
