import type { ProjectFormData } from "../types";
import { Briefcase, LayoutGrid } from "lucide-react";
import { Input } from "@chambitas/ui";
import { SearchableSelect } from "../../../components/molecules/SearchableSelect";

interface ProjectMainDetailsFormProps {
  formData: ProjectFormData;
  setFormData: (data: ProjectFormData) => void;
  dynamicCategories: string[];
}

export function ProjectMainDetailsForm({
  formData,
  setFormData,
  dynamicCategories,
}: ProjectMainDetailsFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Detalles Principales</h3>

      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-emerald-600" /> Título del proyecto <span className="text-red-500">*</span>
        </label>
        <Input
          required
          placeholder="Ej. Desarrollo de App Móvil en React Native"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-white border border-slate-200 rounded-md h-12"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-emerald-600" /> Categoría <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          value={formData.service_category}
          onChange={(val) => setFormData({ ...formData, service_category: val })}
          options={dynamicCategories.length > 0 ? dynamicCategories.map(cat => ({ id: cat, name: cat })) : [{ id: "Software y Tecnología", name: "Software y Tecnología" }]}
          placeholder="Escribe o selecciona una categoría"
          searchPlaceholder="Buscar categoría..."
          noOptionsText="Categoría no encontrada"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700">
          Descripción detallada <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          placeholder="Describe qué necesitas, los objetivos del proyecto y qué esperas del estudiante..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-white border border-slate-200 rounded-md p-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          Fecha límite del proyecto <span className="text-red-500">*</span>
        </label>
        <Input
          required
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            if ('showPicker' in target) {
              try { target.showPicker(); } catch (err) { }
            }
          }}
          className="bg-white border border-slate-200 rounded-md h-12 w-full text-sm font-bold text-slate-900 cursor-pointer"
        />
      </div>
    </div>
  );
}
