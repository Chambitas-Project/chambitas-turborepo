import React from "react";
import { Search, X, Star, BookOpen, AlertCircle, Plus } from "lucide-react";
import { cn } from "@chambitas/ui";
import { type Skill, PROFICIENCY_LABELS } from "../types";

interface StudentSkillsStepProps {
  studentData: any;
  availableSkills: Skill[];
  skillsError: boolean;
  skillSearch: string;
  setSkillSearch: (val: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  suggestionRef: React.RefObject<HTMLDivElement>;
  addSkill: (skillName: string) => void;
  removeSkill: (skillName: string) => void;
  updateProficiency: (skillName: string, level: number) => void;
}

export function StudentSkillsStep({
  studentData,
  availableSkills,
  skillsError,
  skillSearch,
  setSkillSearch,
  showSuggestions,
  setShowSuggestions,
  suggestionRef,
  addSkill,
  removeSkill,
  updateProficiency,
}: StudentSkillsStepProps) {
  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !studentData.skills.some((s: any) => s.name === skill.name)
  );

  return (
    <div className="space-y-8">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-2">
        <BookOpen className="h-6 w-6 text-emerald-600 mx-auto" />
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
          Busca en el catálogo y selecciona las habilidades que dominas.
          Recomendamos empezar con <strong className="font-black">3 habilidades principales</strong>.
        </p>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
          <span>Añadir Habilidad (Máx 10)</span>
          {skillsError && (
            <span className="text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Error de catálogo
            </span>
          )}
        </label>
        <div className="relative" ref={suggestionRef}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => {
                  setSkillSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillSearch);
                  }
                }}
                disabled={studentData.skills.length >= 10 || skillsError}
                placeholder={
                  skillsError
                    ? "El catálogo no está disponible..."
                    : "Ej: React, Figma, Python..."
                }
                className="w-full h-12 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-sm focus:border-emerald-500 outline-none transition-colors"
              />
              {showSuggestions && skillSearch.length > 0 && !skillsError && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-48 overflow-y-auto py-1 custom-scrollbar">
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => addSkill(skill.name)}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-slate-700 text-sm">{skill.name}</span>
                          <span className="text-[10px] text-slate-400">{skill.category}</span>
                        </div>
                        <Plus className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-slate-400 text-sm italic">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => addSkill(skillSearch)}
              disabled={!skillSearch.trim() || studentData.skills.length >= 10 || skillsError}
              className="px-6 rounded-md bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Añadir
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {studentData.skills.length === 0 ? (
          <div className="h-32 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Star className="h-6 w-6 text-slate-200" />
            <p className="text-xs font-bold">Aún no hay habilidades</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {studentData.skills.map((skill: any) => (
              <div
                key={skill.name}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
                    {skill.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-900">{skill.name}</span>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex gap-1 flex-1 md:flex-none">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateProficiency(skill.name, lvl)}
                        className={cn(
                          "h-8 flex-1 md:w-8 md:flex-none rounded flex items-center justify-center text-[10px] font-black transition-all",
                          skill.proficiency_level >= lvl
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-50 text-slate-300 hover:bg-slate-100"
                        )}
                        title={PROFICIENCY_LABELS[lvl]}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.name)}
                    className="h-8 w-8 rounded flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
