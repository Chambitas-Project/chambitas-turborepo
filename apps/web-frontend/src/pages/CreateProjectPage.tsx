import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import { apiClient } from "../api/api-client";
import { useNavigate } from "react-router-dom";
import React from "react";

// Types
import type { Skill, SelectedSkill, ProjectFormData } from "../features/project-form/types";

// Components
import { ProjectMainDetailsForm } from "../features/project-form/components/ProjectMainDetailsForm";
import { ProjectSkillsSelector } from "../features/project-form/components/ProjectSkillsSelector";

export function CreateProjectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    budget: "",
    service_category: "Software Development",
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
            <ProjectMainDetailsForm
              formData={formData}
              setFormData={setFormData}
              dynamicCategories={dynamicCategories}
            />

            {/* Columna Derecha: Presupuesto y Requisitos */}
            <ProjectSkillsSelector
              formData={formData}
              setFormData={setFormData}
              skillsError={skillsError}
              selectedSkills={selectedSkills}
              skillSearch={skillSearch}
              setSkillSearch={setSkillSearch}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              filteredSkills={filteredSkills}
              suggestionRef={suggestionRef}
              addSkill={addSkill}
              updateProficiency={updateProficiency}
              removeSkill={removeSkill}
            />
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
              {isLoading ? "Publicando..." : "Publicar Proyecto"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
