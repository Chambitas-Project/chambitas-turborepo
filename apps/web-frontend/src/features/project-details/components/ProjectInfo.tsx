import { Zap, Calendar } from "lucide-react";
import type { Project } from "../types";

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="p-6 md:p-10 lg:pl-16 space-y-12 pb-10">
      <div className="max-w-4xl space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Sobre el Proyecto</h3>
        <p className="text-lg text-slate-600 leading-relaxed font-medium selection:bg-emerald-100">
          {project.description}
        </p>
      </div>

      <div className="space-y-8">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Habilidades Técnicas</h3>
        <div className="flex flex-wrap gap-3">
          {project.skills.map(skill => (
            <span key={skill.skill_id} className="px-4 py-2 rounded-md border border-slate-200 bg-transparent text-emerald-600 text-[11px] font-bold tracking-tight hover:scale-105 transition-transform cursor-default">
              {skill.skill_name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-12 sm:gap-16 pt-10 border-t border-slate-100">
        <div className="space-y-4">
          <Zap className="h-6 w-6 text-amber-500" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel</p>
            <p className="text-base font-black">Intermedio</p>
          </div>
        </div>
        <div className="space-y-4">
          <Calendar className="h-6 w-6 text-emerald-500" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrega</p>
            <p className="text-base font-black">Flexible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
