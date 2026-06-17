import { ChevronDown } from "lucide-react";
import { cn } from "@chambitas/ui";

interface JobSearchFiltersProps {
  showFilters: boolean;
  categories: { label: string; value: string }[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  onClearFilters: () => void;
}

export function JobSearchFilters({
  showFilters,
  categories,
  activeCategory,
  setActiveCategory,
  maxPrice,
  setMaxPrice,
  onClearFilters,
}: JobSearchFiltersProps) {
  return (
    <aside className={cn("lg:col-span-3 sticky top-24 transition-all", showFilters ? "block" : "hidden lg:block")}>
      <div className="space-y-6 px-2">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-xl font-black text-slate-900">Filtra tus resultados</h3>
          <button
            onClick={onClearFilters}
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
          <div className="space-y-3">
            {categories.map(cat => (
              <label key={cat.value} className="flex items-center justify-between cursor-pointer group">
                <span className={cn("text-sm transition-colors", activeCategory === cat.value ? "text-slate-900 font-black" : "text-slate-500 font-medium group-hover:text-slate-900")}>
                  {cat.label}
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={activeCategory === cat.value}
                  onChange={() => setActiveCategory(cat.value)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between cursor-pointer">
            <p className="text-sm font-bold text-slate-900">Precio Máximo</p>
            <ChevronDown className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="space-y-4 pt-2">
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>S/0</span>
              <span className="text-emerald-700">S/.{maxPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
