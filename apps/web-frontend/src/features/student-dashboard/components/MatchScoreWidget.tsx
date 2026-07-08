import { useState } from "react";
import { Button } from "@chambitas/ui";
import { ChevronRight, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import type { Profile } from "../types";
import piononoImg from "../../../assets/pionono.webp";

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
            <div className="flex items-start gap-4 group">
              <img src={piononoImg} alt="Pionono IA" className="w-20 h-20 mt-1 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 z-10 shrink-0" />
              <div className="relative bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex-1 space-y-4">
                <div className="absolute top-10 -left-1.5 w-3 h-3 bg-white border-l border-t border-emerald-100 transform -rotate-45 rounded-tl-xs"></div>
                <p className="text-[12px] text-slate-600 leading-relaxed relative z-10">
                  ¡Hola! Soy <span className="font-bold text-emerald-700">Pionono</span>. Mi motor de IA analizó tu perfil y estas son tus métricas.
                </p>

                <div className="space-y-1">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">
                    {maxMatchScore}%
                  </span>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    Nivel de Compatibilidad
                  </p>
                </div>

                <div className="h-2.5 w-full bg-slate-100 rounded-md overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-600 rounded-sm shadow-sm"
                    style={{ width: `${maxMatchScore}%` }}
                  />
                </div>

                {maxMatchScore >= 80 ? (
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    ¡Excelente! Hay proyectos de <span className="text-slate-900">{profile?.career || 'tu área'}</span> que hacen un <span className="text-emerald-600">match casi perfecto</span> con tus habilidades actuales. ¡Aprovecha y postula!
                  </p>
                ) : maxMatchScore >= 40 ? (
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    Hemos encontrado tareas de <span className="text-slate-900">{profile?.career || 'tu área'}</span> con <span className="text-amber-600">compatibilidad media</span>. Añade más habilidades a tu perfil para encontrar tu trabajo ideal.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    Actualmente, los proyectos disponibles tienen <span className="text-indigo-500">poca compatibilidad</span> con tu perfil. ¡Sigue aprendiendo y agrega más skills para subir este porcentaje!
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = "/jobs")}
              className="w-full bg-slate-900 hover:bg-black text-white rounded-md h-12 font-bold text-sm shadow-sm shadow-slate-200 transition-all"
            >
              Explorar Tareas
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <img src={piononoImg} alt="Pionono IA" className="w-20 h-20 object-contain drop-shadow-md opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 z-10 shrink-0" />
              <div className="relative bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm flex-1">
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-50 border-l border-t border-slate-100 transform -rotate-45 rounded-tl-xs"></div>
                <p className="text-[12px] text-slate-600 leading-relaxed relative z-10">
                  Soy <span className="font-bold text-slate-700">Pionono</span>. Aún no tengo suficientes datos tuyos para que mi IA pueda analizar tu compatibilidad.
                </p>
              </div>
            </div>
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 hidden">
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
