import { useState, useMemo, type RefObject } from "react";
import { Banknote, Clock, CheckCircle2, AlertCircle, Search, Plus, Star, X, Calendar, Sparkles, AlertTriangle, Check } from "lucide-react";
import { Input, Badge, Button, cn } from "@chambitas/ui";
import type { Skill, SelectedSkill, ProjectFormData } from "../types";
import { DAYS, TIME_SLOTS } from "../../onboarding/types";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftConstraints, setDraftConstraints] = useState<Record<string, string>>({});

  const isAsync = formData.schedule_mode === "async";

  // Helper para generar matriz de disponibilidad completamente desleccionada (todo '0')
  function createEmptyAvailability() {
    return DAYS.reduce((acc, day) => {
      acc[day.id] = "0".repeat(32);
      return acc;
    }, {} as Record<string, string>);
  }

  // Helper para contar cuántas horas están seleccionadas en una matriz
  const calculateSelectedHours = (constraints?: Record<string, string>) => {
    if (!constraints) return 0;
    let totalSlots = 0;
    Object.values(constraints).forEach((dayStr) => {
      if (typeof dayStr === "string") {
        for (const char of dayStr) {
          if (char === "1") totalSlots++;
        }
      }
    });
    return totalSlots * 0.5; // cada bloque equivale a 0.5 hrs
  };

  const selectedHoursInModal = useMemo(
    () => calculateSelectedHours(draftConstraints),
    [draftConstraints]
  );

  const selectedHoursInForm = useMemo(
    () => calculateSelectedHours(formData.schedule_constraints),
    [formData.schedule_constraints]
  );

  const maxHours = Number(formData.max_hours_week) || 0;
  const isExceedingHours = maxHours > 0 && selectedHoursInModal > maxHours;

  const handleOpenModal = () => {
    const current = formData.schedule_constraints;
    const isAllOn = current && Object.values(current).every(str => str === "1".repeat(32));

    // Si no existen constraints o están todos seleccionados por defecto, arrancar todo desmarcado (en '0')
    if (!current || isAllOn) {
      setDraftConstraints(createEmptyAvailability());
    } else {
      setDraftConstraints(current);
    }
    setIsModalOpen(true);
  };

  const toggleModalBlock = (dayId: string, index: number) => {
    const dayStr = draftConstraints[dayId] || "0".repeat(32);
    const dayArray = dayStr.split("");
    dayArray[index] = dayArray[index] === "1" ? "0" : "1";

    setDraftConstraints({
      ...draftConstraints,
      [dayId]: dayArray.join(""),
    });
  };

  const handleSelectAllDay = (dayId: string) => {
    const dayStr = draftConstraints[dayId] || "0".repeat(32);
    const allSelected = dayStr === "1".repeat(32);
    setDraftConstraints({
      ...draftConstraints,
      [dayId]: allSelected ? "0".repeat(32) : "1".repeat(32),
    });
  };

  const handleClearAllModal = () => {
    setDraftConstraints(createEmptyAvailability());
  };

  const handleSaveModal = () => {
    const updatedMaxHours =
      (!formData.max_hours_week || Number(formData.max_hours_week) === 0) && selectedHoursInModal > 0
        ? String(selectedHoursInModal)
        : formData.max_hours_week;

    setFormData({
      ...formData,
      max_hours_week: updatedMaxHours,
      schedule_mode: "specific",
      schedule_constraints: draftConstraints,
    });
    setIsModalOpen(false);
  };

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
            <Clock className="h-4 w-4 text-emerald-600" /> Max. Horas / Semana
          </label>
          <Input
            type="number"
            min="0.5"
            step="0.5"
            placeholder="Ej. 10.5"
            value={formData.max_hours_week}
            onChange={(e) => setFormData({ ...formData, max_hours_week: e.target.value })}
            className="bg-white border border-slate-200 rounded-md h-12"
          />
        </div>
      </div>

      {/* Restricciones de Horario (Modo Híbrido: Asincrónico vs Específico en Modal) */}
      <div className="space-y-4 pt-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" /> Horario del Proyecto
        </label>

        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, schedule_mode: "async" })}
            className={cn(
              "py-2.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
              isAsync
                ? "bg-white text-emerald-800 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Asincrónico (Flexible)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenModal}
            className={cn(
              "py-2.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
              !isAsync
                ? "bg-white text-emerald-800 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Horario Específico</span>
          </button>
        </div>

        {isAsync ? (
          <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-lg text-xs text-emerald-900 font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong className="font-bold">Horario 100% flexible:</strong> El estudiante completará las tareas libremente según su disponibilidad personal. Matching al 100%.
            </span>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Horario Seleccionado
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedHoursInForm > 0
                    ? `${selectedHoursInForm} hrs semanales definidas en la matriz`
                    : "No has marcado bloques aún (0 hrs)"}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleOpenModal}
                className="h-9 px-4 text-xs font-bold text-emerald-700 bg-white border-emerald-200 hover:bg-emerald-50 cursor-pointer shrink-0"
              >
                Configurar Horario
              </Button>
            </div>

            {maxHours > 0 && (
              <div className={cn(
                "p-2.5 rounded-lg text-[11px] font-bold flex items-center justify-between border",
                selectedHoursInForm > maxHours
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : selectedHoursInForm === maxHours
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
              )}>
                <span>Max. horas permitidas: <strong>{maxHours} hrs</strong></span>
                <span>Seleccionadas: <strong>{selectedHoursInForm} hrs</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal interactivo de Horario Específico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-emerald-700" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Configurar Horario Específico</h4>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Marca los bloques exactos donde requieres conexión o presencia del estudiante.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Barra de estado de horas y tope */}
            <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700">
                  Total Seleccionado: <strong className="font-black text-emerald-700 text-sm">{selectedHoursInModal} hrs</strong>
                </span>
                {maxHours > 0 && (
                  <span className="font-bold text-slate-500">
                    Tope Semanal: <strong className="font-black text-slate-800 text-sm">{maxHours} hrs</strong>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleClearAllModal}
                className="text-[11px] font-bold text-slate-500 hover:text-red-600 underline cursor-pointer"
              >
                Desmarcar Todo
              </button>
            </div>

            {/* Alerta de exceso de horas */}
            {isExceedingHours && (
              <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Las horas seleccionadas ({selectedHoursInModal} hrs) superan el máximo establecido de {maxHours} hrs/semana. Ajusta tus bloques.
                </span>
              </div>
            )}

            {/* Grid de Horarios con Soporte Mobile */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="overflow-x-auto custom-scrollbar pb-2">
                <div className="min-w-137.5 space-y-2">
                  {/* Encabezado de Días */}
                  <div className="grid grid-cols-8 gap-2 items-center text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase">Hora</div>
                    {DAYS.map((day) => {
                      const dayStr = draftConstraints[day.id] || "0".repeat(32);
                      const isAllSelected = dayStr === "1".repeat(32);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => handleSelectAllDay(day.id)}
                          title="Hacer clic para marcar/desmarcar todo el día"
                          className={cn(
                            "py-1 px-1 rounded text-[10px] font-black uppercase transition-colors border cursor-pointer",
                            isAllSelected
                              ? "bg-emerald-600 text-white border-emerald-700"
                              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Filas de Franjas Horarias */}
                  <div className="space-y-1 max-h-87.5 overflow-y-auto pr-1 custom-scrollbar">
                    {TIME_SLOTS.map((time, idx) => (
                      <div key={time} className="grid grid-cols-8 gap-2 items-center">
                        <div className="text-[10px] font-bold text-slate-400 text-right pr-1 shrink-0">
                          {time}
                        </div>
                        {DAYS.map((day) => {
                          const isSelected = draftConstraints[day.id]?.[idx] === "1";
                          return (
                            <button
                              key={`${day.id}-${idx}`}
                              type="button"
                              onClick={() => toggleModalBlock(day.id, idx)}
                              className={cn(
                                "h-6 rounded-md transition-all border cursor-pointer flex items-center justify-center",
                                isSelected
                                  ? "bg-emerald-500 border-emerald-600 shadow-xs text-white"
                                  : "bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                💡 Haz clic sobre las cabeceras de los días para marcar el día entero.
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-5 text-slate-600 font-bold border-slate-200 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveModal}
                  disabled={isExceedingHours}
                  className={cn(
                    "h-11 px-6 font-black text-white cursor-pointer transition-all",
                    isExceedingHours ? "bg-slate-300 cursor-not-allowed" : "bg-[#065f46] hover:bg-[#064e3b]"
                  )}
                >
                  Guardar Horario
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-md border border-slate-100 max-h-60 overflow-y-auto py-2 custom-scrollbar">
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
                          "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center min-w-12 cursor-pointer",
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
