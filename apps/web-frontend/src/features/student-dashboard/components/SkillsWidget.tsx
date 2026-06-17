import { Plus, Trash2 } from "lucide-react";
import type { Profile, CatalogSkill } from "../types";
import { PROFICIENCY_LABELS } from "../types";

interface SkillsWidgetProps {
  profile: Profile | null;
  availableSkills: CatalogSkill[];
  onAddSkillClick: (type: 'hard' | 'soft') => void;
  onRemoveSkill: (skillName: string) => void;
}

export function SkillsWidget({
  profile,
  availableSkills,
  onAddSkillClick,
  onRemoveSkill,
}: SkillsWidgetProps) {
  const hardSkills =
    profile?.skills?.filter((skill) => {
      const cat = availableSkills.find((s) => s.name === skill.name);
      return !cat || cat.type !== "soft";
    }) || [];

  const softSkills =
    profile?.skills?.filter((skill) => {
      const cat = availableSkills.find((s) => s.name === skill.name);
      return cat && cat.type === "soft";
    }) || [];

  return (
    <div className="space-y-8">
      {/* Habilidades Técnicas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Habilidades Técnicas
          </h4>
          <Plus
            onClick={() => onAddSkillClick("hard")}
            className="h-5 w-5 text-emerald-600 cursor-pointer hover:scale-110 transition-transform bg-emerald-50 p-1 rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {hardSkills.length > 0 ? (
            hardSkills.map((skill) => (
              <div
                key={skill.name}
                className="space-y-3 group bg-white/50 md:bg-transparent p-4 md:p-0 rounded-md border border-slate-200 md:border-none"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 tracking-tight">
                    {skill.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                      {PROFICIENCY_LABELS[skill.level]}
                    </span>
                    <Trash2
                      onClick={() => onRemoveSkill(skill.name)}
                      className="h-4 w-4 text-red-300 cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-red-500"
                    />
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${(skill.level / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-300 italic">
                No has añadido habilidades técnicas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Habilidades Blandas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Habilidades Blandas
          </h4>
          <Plus
            onClick={() => onAddSkillClick("soft")}
            className="h-5 w-5 text-indigo-600 cursor-pointer hover:scale-110 transition-transform bg-indigo-50 p-1 rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {softSkills.length > 0 ? (
            softSkills.map((skill) => (
              <div
                key={skill.name}
                className="space-y-3 group bg-white/50 md:bg-transparent p-4 md:p-0 rounded-md border border-slate-200 md:border-none"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 tracking-tight">
                    {skill.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
                      {PROFICIENCY_LABELS[skill.level]}
                    </span>
                    <Trash2
                      onClick={() => onRemoveSkill(skill.name)}
                      className="h-4 w-4 text-red-300 cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-red-500"
                    />
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${(skill.level / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-300 italic">
                No has añadido habilidades blandas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
