import { Zap, ChevronRight } from "lucide-react";
import { Button } from "@chambitas/ui";
import { useNavigate } from "react-router-dom";
import { type Recommendation } from "../types";

interface RecommendationsHeroProps {
  recommendations: Recommendation[];
}

export function RecommendationsHero({ recommendations }: RecommendationsHeroProps) {
  const navigate = useNavigate();

  if (recommendations.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-xl bg-[#0F172A] p-8 md:p-12 text-white shadow-xl transition-all hover:shadow-emerald-900/10">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px]" />
      <div className="relative z-10 max-w-2xl space-y-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <Zap className="h-5 w-5 fill-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Match Inteligente</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Recomendados para ti</h2>
        <p className="text-slate-400 text-lg font-medium leading-relaxed">
          Basado en tu perfil, hemos encontrado <span className="text-emerald-400">{recommendations.length} proyectos</span> abiertos para postular hoy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 h-12 rounded-md shadow-md group transition-all active:scale-95">
            Ver coincidencias <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="border-slate-700 text-slate-300 hover:bg-slate-800 h-12 px-8 rounded-md font-black">
            Actualizar Perfil
          </Button>
        </div>
      </div>
    </section>
  );
}
