import type { RefObject } from "react";
import { Banknote, Clock, CheckCircle2, AlertCircle, Search, Plus, Star, X } from "lucide-react";
import { Input, Badge, cn } from "@chambitas/ui";
import type { Skill, SelectedSkill, ProjectFormData } from "../types";

interface ProjectSkillsSelectorProps {
  formData: ProjectFormData;
  setFormData: (data: ProjectFormData) => void;
  skillsError: boolean;
  selectedSkills: SelectedSkill[];
  skillSearch: string;
  setSkillSearch: (search: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  filteredSkills: Skill[];
  suggestionRef: RefObject<HTMLDivElement>;
  addSkill: (skill: Skill) => void;
  updateProficiency: (skillId: string, level: number) => void;
  removeSkill: (skillId: string) => void;
}

export function ProjectSkillsSelector({
  formData,
  setFormData,
  skillsError,
  selectedSkills,
  skillSearch,
  setSkillSearch,
  showSuggestions,
  setShowSuggestions,
  filteredSkills,
  suggestionRef,
  addSkill,
  updateProficiency,
  removeSkill,
}: ProjectSkillsSelectorProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Presupuesto y Habilidades</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-emerald-600" /> Presupuesto (S/) <span className="text-red-500">*</span>
          </label>
          <Input
            required
            type="number"
            min="0"
            placeholder="Ej. 150"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="bg-white border border-slate-200 rounded-md h-12"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" /> Horas / Semana
          </label>
          <Input
            type="number"
            min="1"
            placeholder="Opcional (Ej. 20)"
            value={formData.max_hours_week}
            onChange={(e) => setFormData({ ...formData, max_hours_week: e.target.value })}
            className="bg-white border border-slate-200 rounded-md h-12"
          />
        </div>
      </div>

      {/* Selector de Habilidades */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-1 relative" ref={suggestionRef}>
          <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Requisitos / Habilidades <span className="text-red-500">*</span>
            </span>
            <Badge className="bg-emerald-100 text-emerald-700 font-black text-[10px]">{selectedSkills.length}/10</Badge>
          </label>

          {skillsError && (
            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              No se pudo cargar el catálogo de habilidades.
            </span>
          )}

          <div className="relative mt-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Busca una habilidad (Ej: React, Python...)"
              className="h-12 pl-12 rounded-md bg-white border border-slate-200 focus:ring-emerald-500/10 text-sm font-bold"
              value={skillSearch}
              onChange={(e) => {
                setSkillSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
          </div>

          {showSuggestions && skillSearch.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-md border border-slate-100 max-h-[240px] overflow-y-auto py-2 custom-scrollbar">
              {filteredSkills.length > 0 ? (
                <>
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="w-full px-5 py-3 text-left hover:bg-emerald-50 hover:text-emerald-700 font-bold transition-colors text-sm flex items-center justify-between group cursor-pointer"
                    >
                      <span>{skill.name}</span>
                      <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-5 py-3 text-slate-400 font-bold text-sm italic">
                  No se encontraron resultados.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista de Seleccionados */}
        <div className="space-y-3 mt-4">
          {selectedSkills.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <p className="text-slate-400 font-bold text-sm">Selecciona al menos 1 habilidad requerida.</p>
            </div>
          ) : (
            selectedSkills.map((skill) => (
              <div key={skill.skill_id} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-100 rounded-md shadow-none hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                    <Star className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm wrap-break-word">{skill.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-50 p-1 rounded-md border border-slate-100 gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateProficiency(skill.skill_id, level)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center min-w-[48px] cursor-pointer",
                          skill.proficiency_level === level
                            ? "bg-emerald-600 text-white shadow-none"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white"
                        )}
                      >
                        <span>Nvl {level}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.skill_id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
