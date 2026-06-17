import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Briefcase, Clock, LayoutGrid, CheckCircle2, X, Search, Plus, Star, AlertCircle, Banknote } from "lucide-react";
import { Button, Input, cn, Badge } from "@chambitas/ui";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import { apiClient } from "../api/api-client";
import { useNavigate } from "react-router-dom";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface SelectedSkill {
  skill_id: string;
  name: string;
  proficiency_level: number;
}


export function CreateProjectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    service_category: "",
    deadline: "",
    max_hours_week: ""
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillsError, setSkillsError] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const dynamicCategories = useMemo(() => {
    const uniqueCategories = new Set(availableSkills.map(s => s.category).filter(Boolean));
    return Array.from(uniqueCategories);
  }, [availableSkills]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await apiClient.get("/profile/skills");
        const skillsData = Array.isArray(response.data) ? response.data : (response.data?.skills || []);
        setAvailableSkills(skillsData);
        setSkillsError(false);
      } catch (err: any) {
        console.error("Error fetching skills:", err);
        setSkillsError(true);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.some(s => s.skill_id === skill.id)
  );

  const addSkill = (skill: Skill) => {
    if (selectedSkills.length >= 10) return;
    setSelectedSkills(prev => [...prev, { skill_id: skill.id, name: skill.name, proficiency_level: 3 }]);
    setSkillSearch("");
    setShowSuggestions(false);
  };

  const removeSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(s => s.skill_id !== skillId));
  };

  const updateProficiency = (skillId: string, level: number) => {
    setSelectedSkills(prev => prev.map(s =>
      s.skill_id === skillId ? { ...s, proficiency_level: level } : s
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await employerApi.createProject({
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
        service_category: formData.service_category,
        requirements: selectedSkills.map(s => s.name),
        skills: selectedSkills.map(s => ({
          skill_id: s.skill_id,
          min_proficiency: s.proficiency_level,
          mandatory: true
        })),
        deadline: formData.deadline || undefined,
        max_hours_week: formData.max_hours_week ? Number(formData.max_hours_week) : undefined
      });
      // Redirect on success
      navigate("/employer/projects");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al publicar el empleo. Revisa los datos.");
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="employer">
      <button
        onClick={() => navigate("/employer/projects")}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mis publicaciones
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-2">Publicar Microtrabajo</h1>
          <p className="text-slate-500 font-medium text-lg">Define los detalles para encontrar al estudiante ideal para tu proyecto.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md mb-8 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 lg:p-10 shadow-none border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">

            {/* Columna Izquierda: Información Principal */}
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
                <Input 
                  required
                  list="category-options"
                  value={formData.service_category}
                  onChange={(e) => setFormData({...formData, service_category: e.target.value})}
                  placeholder="Escribe o selecciona una categoría"
                  className="w-full bg-white border border-slate-200 rounded-md h-12"
                />
                <datalist id="category-options">
                  {dynamicCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                  {dynamicCategories.length === 0 && (
                    <option value="Software Development" />
                  )}
                </datalist>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Descripción detallada <span className="text-red-500">*</span></label>
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

            {/* Columna Derecha: Presupuesto y Requisitos */}
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
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Requisitos / Habilidades <span className="text-red-500">*</span></span>
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
                      onChange={e => {
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
                          {filteredSkills.map(skill => (
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
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/employer/projects")}
              className="h-14 px-8 rounded-md border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedSkills.length === 0}
              className={cn(
                "h-14 px-8 rounded-md font-black text-white shadow-none cursor-pointer transition-all",
                isLoading || selectedSkills.length === 0 ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-[#065f46] hover:bg-[#064e3b]"
              )}
            >
              {isLoading ? "Publicando..." : "Publicar Microtrabajo"}
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
