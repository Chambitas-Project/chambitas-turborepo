import { useState, useEffect, type KeyboardEvent } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn, Button } from "@chambitas/ui";

export interface FilterState {
  category: string;
  skills: string[];
  minPrice: number;
  maxPrice: number;
  recommended: boolean;
}

interface JobSearchFiltersProps {
  showFilters: boolean;
  categories: { label: string; value: string }[];
  initialFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function JobSearchFilters({
  showFilters,
  categories,
  initialFilters,
  onApplyFilters,
  onClearFilters,
}: JobSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(initialFilters);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!localFilters.skills.includes(newSkill)) {
        setLocalFilters(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setLocalFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleClear = () => {
    onClearFilters();
    setSkillInput("");
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };
  return (
    <aside className={cn("lg:col-span-3 sticky top-24 transition-all", showFilters ? "block" : "hidden lg:block")}>
      <div className="space-y-6 px-2">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-xl font-black text-slate-900">Filtra tus resultados</h3>
          <button
            onClick={handleClear}
            className="text-[10px] font-black text-slate-400 uppercase hover:text-emerald-600 transition-colors cursor-pointer"
          >
            Limpiar
          </button>
        </div>

        {/* Categorías */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between cursor-pointer">
            <p className="text-sm font-bold text-slate-900">Categorías</p>
            <ChevronDown className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map(cat => (
              <label key={cat.value} className="flex items-center justify-between cursor-pointer group">
                <span className={cn("text-sm transition-colors", localFilters.category === cat.value ? "text-slate-900 font-black" : "text-slate-500 font-medium group-hover:text-slate-900")}>
                  {cat.label}
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={localFilters.category === cat.value}
                  onChange={() => setLocalFilters(prev => ({ ...prev, category: cat.value }))}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Recomendados */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className={cn("text-sm transition-colors font-bold", localFilters.recommended ? "text-emerald-600" : "text-slate-900")}>
              Solo Recomendados
            </span>
            <div className={cn("w-10 h-6 rounded-full transition-colors relative", localFilters.recommended ? "bg-emerald-500" : "bg-slate-200")}>
              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", localFilters.recommended ? "left-5" : "left-1")} />
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={localFilters.recommended}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, recommended: e.target.checked }))}
            />
          </label>
        </div>

        {/* Habilidad */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between cursor-pointer">
            <p className="text-sm font-bold text-slate-900">Habilidad</p>
            <ChevronDown className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="pt-2 space-y-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Ej. React, Node.js (Presiona Enter)"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
            />
            {localFilters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {localFilters.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer hover:text-emerald-900" onClick={() => handleRemoveSkill(skill)} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Precio */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-emerald-500 transition-all text-slate-700 font-medium"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Máximo</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-emerald-500 transition-all text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleApply} className="w-full font-black mt-4 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border-none">
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </aside>
  );
}
