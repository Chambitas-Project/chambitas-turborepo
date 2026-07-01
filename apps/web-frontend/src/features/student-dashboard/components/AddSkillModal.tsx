import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, Search, Plus } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import type { CatalogSkill } from "../types";
import { PROFICIENCY_LABELS } from "../types";

export interface AddSkillFormData {
  name: string;
  level: number;
}

interface AddSkillModalProps {
  isOpen: boolean;
  updating: boolean;
  addingSkillType: "hard" | "soft" | null;
  filteredCatalogSkills: CatalogSkill[];
  onClose: () => void;
  onSubmit: (data: AddSkillFormData) => void;
  skillSearch: string;
  setSkillSearch: (val: string) => void;
}

export function AddSkillModal({
  isOpen,
  updating,
  addingSkillType,
  filteredCatalogSkills,
  onClose,
  onSubmit,
  skillSearch,
  setSkillSearch,
}: AddSkillModalProps) {
  const [form, setForm] = useState<AddSkillFormData>({ name: "", level: 3 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", level: 3 });
      setSkillSearch("");
      setShowSuggestions(false);
    }
  }, [isOpen, setSkillSearch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {addingSkillType === "soft" ? "Añadir Habilidad Blanda" : "Añadir Habilidad Técnica"}
          </h2>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-2" ref={suggestionRef}>
            <label className="text-xs font-semibold text-slate-600">Buscar en Catálogo</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => {
                  setSkillSearch(e.target.value);
                  setShowSuggestions(true);
                  setForm({ ...form, name: e.target.value });
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={
                  addingSkillType === "soft" 
                    ? "Ej: Liderazgo, Comunicación..." 
                    : "Ej: React, Python..."
                }
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-sm outline-none transition-colors placeholder:text-slate-400",
                  addingSkillType === "soft"
                    ? "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    : "focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                )}
              />
              {showSuggestions && skillSearch.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-48 overflow-y-auto py-1 custom-scrollbar">
                  {filteredCatalogSkills.length > 0 ? (
                    filteredCatalogSkills.map((skill) => (
                      <button
                        key={skill.id}
                        onClick={() => {
                          setForm({ ...form, name: skill.name });
                          setSkillSearch(skill.name);
                          setShowSuggestions(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left transition-colors flex items-center justify-between group",
                          addingSkillType === "soft"
                            ? "hover:bg-indigo-50 text-indigo-900"
                            : "hover:bg-emerald-50 text-emerald-900"
                        )}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-sm">{skill.name}</span>
                          {skill.category && (
                            <span
                              className={cn(
                                "text-[10px] font-bold opacity-70",
                                addingSkillType === "soft" ? "text-indigo-600" : "text-emerald-600"
                              )}
                            >
                              {skill.category}
                            </span>
                          )}
                        </div>
                        <Plus
                          className={cn(
                            "h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity",
                            addingSkillType === "soft" ? "text-indigo-600" : "text-emerald-600"
                          )}
                        />
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-slate-400 text-sm italic">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Nivel de Dominio</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setForm({ ...form, level: lvl })}
                  className={cn(
                    "flex-1 min-w-[30%] px-2 py-2 rounded-md font-medium text-[11px] transition-colors text-center border",
                    form.level === lvl
                      ? addingSkillType === "soft"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {PROFICIENCY_LABELS[lvl]}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={updating || !form.name}
            className={cn(
              "w-full text-white font-semibold py-2.5 rounded-md text-sm transition-colors mt-2",
              addingSkillType === "soft"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
