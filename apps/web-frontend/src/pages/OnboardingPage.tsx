import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api-client";
import { Button } from "@chambitas/ui";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles, AlertCircle } from "lucide-react";

import { type Skill, type Career, type SelectedSkill, DEFAULT_UNIVERSITY_ID } from "../features/onboarding/types";
import { OnboardingSidebar } from "../features/onboarding/components/OnboardingSidebar";
import { StudentIdentityStep } from "../features/onboarding/components/StudentIdentityStep";
import { StudentAvailabilityStep } from "../features/onboarding/components/StudentAvailabilityStep";
import { StudentSkillsStep } from "../features/onboarding/components/StudentSkillsStep";
import { EmployerProfileStep } from "../features/onboarding/components/EmployerProfileStep";
import { useUxTelemetry } from "../hooks/useUxTelemetry";

export function OnboardingPage() {
  const { user, logout, refreshUser } = useAuth();
  
  const { completeStep } = useUxTelemetry(user?.role === 'employer' ? 'EmployerOnboarding' : 'StudentOnboarding', 'ProfileSetup');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState(false);
  const [careersError, setCareersError] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Estados para Estudiante
  const [studentData, setStudentData] = useState({
    fullName: "",
    phoneNumber: "",
    careerId: "",
    academicCycle: 1,
    gpa: 15.0,
    bio: "",
    skills: [] as SelectedSkill[],
    availability: {
      mon: "0".repeat(32), tue: "0".repeat(32), wed: "0".repeat(32),
      thu: "0".repeat(32), fri: "0".repeat(32), sat: "0".repeat(32), sun: "0".repeat(32),
    }
  });

  // Estados para Empleador
  const [employerData, setEmployerData] = useState({
    name: "",
    companyName: "",
    description: ""
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableCareers, setAvailableCareers] = useState<Career[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const skillsResponse = await apiClient.get("/profile/skills");
        const skillsData = Array.isArray(skillsResponse.data) ? skillsResponse.data : (skillsResponse.data?.skills || []);
        setAvailableSkills(skillsData);
        setSkillsError(false);
      } catch (err) {
        setSkillsError(true);
      }

      try {
        const careersResponse = await apiClient.get(`/profile/careers?university_id=${DEFAULT_UNIVERSITY_ID}`);
        const careersData = Array.isArray(careersResponse.data) ? careersResponse.data : (careersResponse.data?.careers || []);
        setAvailableCareers(careersData);
        setCareersError(false);
      } catch (err) {
        setCareersError(true);
      }
    };
    if (user) fetchCatalogData();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateTotalHours = () => {
    const totalBits = Object.values(studentData.availability)
      .join("")
      .split("")
      .filter(bit => bit === "1").length;
    return totalBits * 0.5;
  };

  const isStepValid = () => {
    if (user?.role === "student") {
      if (step === 1) return studentData.fullName.trim().length > 3 && studentData.phoneNumber.trim().length === 9 && studentData.phoneNumber.startsWith('9') && studentData.bio.trim().length > 10 && studentData.careerId !== "";
      if (step === 2) return studentData.gpa >= 0 && studentData.gpa <= 20 && calculateTotalHours() >= 4;
      if (step === 3) return studentData.skills.length >= 3;
    } else {
      if (step === 1) return employerData.name.trim().length > 2 && employerData.companyName.trim().length > 2 && employerData.description.trim().length > 20;
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      if (user?.role === "student" && step === 1) {
        if (studentData.fullName.trim().length <= 3 || studentData.phoneNumber.trim().length === 0 || studentData.bio.trim().length <= 10 || studentData.careerId === "") {
          setError("Por favor, completa todos los campos obligatorios (*).");
        } else if (studentData.phoneNumber.length !== 9 || !studentData.phoneNumber.startsWith('9')) {
          setError("El número de celular debe ser de Perú (9 dígitos y empezar con 9).");
        }
      } else if (user?.role === "student" && step === 2 && calculateTotalHours() < 4) {
        setError("Por favor, selecciona al menos 4 horas de disponibilidad semanal.");
      } else if (user?.role === "student" && step === 3 && studentData.skills.length < 3) {
        setError("Por favor, añade al menos 3 habilidades del catálogo.");
      } else {
        setError("Por favor, completa todos los campos requeridos correctamente.");
      }
      return;
    }
    setError(null);
    const maxStep = user?.role === "student" ? 3 : 1;
    if (step < maxStep) {
      setStep(s => s + 1);
    } else {
      if (user?.role === "student") {
        handleStudentSubmit();
      } else {
        handleEmployerSubmit();
      }
    }
  };

  const handleStudentSubmit = async () => {
    setLoading(true);
    setError(null);
    const payload = {
      full_name: studentData.fullName,
      phone_number: studentData.phoneNumber,
      career_id: studentData.careerId,
      academic_cycle: Number(studentData.academicCycle),
      gpa: Number(studentData.gpa),
      weekly_availability: Math.round(calculateTotalHours()),
      bio: studentData.bio,
      skill_inputs: studentData.skills,
      availability_blocks: studentData.availability
    };

    try {
      await apiClient.post("/profile/onboarding/student", payload);
      await refreshUser();
      completeStep();
      navigate("/");
    } catch (err: any) {
      const respStatus = err.response?.status;
      if (respStatus === 500) setError("Error interno del servidor (500).");
      else if (respStatus === 503) setError("El servicio está inactivo. Inténtalo de nuevo.");
      else if (respStatus === 400) setError("Error de validación.");
      else if (respStatus === 401) setError("Sesión expirada.");
      else setError(err.response?.data?.message || "Error al completar onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/profile/onboarding/employer", {
        name: employerData.name,
        company_name: employerData.companyName,
        description: employerData.description
      });
      await refreshUser();
      completeStep();
      navigate("/");
    } catch (err: any) {
      if (err.response?.status === 401) setError("Sesión expirada.");
      else setError(err.response?.data?.message || "Error al completar onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = (dayId: string, index: number) => {
    setStudentData(prev => {
      const currentBits = (prev.availability as any)[dayId].split("");
      currentBits[index] = currentBits[index] === "1" ? "0" : "1";
      return {
        ...prev,
        availability: { ...prev.availability, [dayId]: currentBits.join("") }
      };
    });
  };

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed || studentData.skills.length >= 10) return;
    const exists = availableSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) return;
    if (studentData.skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkillSearch("");
      setShowSuggestions(false);
      return;
    }
    setStudentData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: trimmed, proficiency_level: 3 }]
    }));
    setSkillSearch("");
    setShowSuggestions(false);
  };

  const removeSkill = (skillName: string) => {
    setStudentData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const updateProficiency = (skillName: string, level: number) => {
    setStudentData(prev => ({
      ...prev,
      skills: prev.skills.map(s =>
        s.name === skillName ? { ...s, proficiency_level: level } : s
      )
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-slate-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row">
        <OnboardingSidebar userRole={user.role} step={step} onLogout={logout} />

        <main className="flex-1 p-6 lg:p-12 flex flex-col items-center justify-start overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl w-full">
            <header className="mb-8">
              <div className="flex items-center gap-2 text-emerald-600 mb-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Bienvenido</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                {user.role === "student" ? (
                  step === 1 ? "¿Quién eres?" : step === 2 ? "¿Cuándo estás libre?" : "Tus superpoderes"
                ) : (
                  "Perfil de Empresa"
                )}
              </h1>
              <p className="mt-3 text-slate-500 font-medium text-base">
                {step === 2 && user.role === "student"
                  ? "Define tus bloques de disponibilidad para que la IA te asigne los mejores microtrabajos."
                  : "Completa esta información para empezar."}
              </p>
            </header>

            <div className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex flex-col gap-3 animate-shake">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                </div>
              )}

              {user.role === "student" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {step === 1 && (
                    <StudentIdentityStep
                      studentData={studentData}
                      setStudentData={setStudentData}
                      availableCareers={availableCareers}
                      careersError={careersError}
                    />
                  )}
                  {step === 2 && (
                    <StudentAvailabilityStep
                      studentData={studentData}
                      toggleAvailability={toggleAvailability}
                      calculateTotalHours={calculateTotalHours}
                    />
                  )}
                  {step === 3 && (
                    <StudentSkillsStep
                      studentData={studentData}
                      availableSkills={availableSkills}
                      skillsError={skillsError}
                      skillSearch={skillSearch}
                      setSkillSearch={setSkillSearch}
                      showSuggestions={showSuggestions}
                      setShowSuggestions={setShowSuggestions}
                      suggestionRef={suggestionRef}
                      addSkill={addSkill}
                      removeSkill={removeSkill}
                      updateProficiency={updateProficiency}
                    />
                  )}
                </div>
              )}

              {user.role === "employer" && (
                <EmployerProfileStep
                  employerData={employerData}
                  setEmployerData={setEmployerData}
                />
              )}
            </div>

            <footer className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => { setStep(s => s - 1); setError(null); }}
                  className="rounded-full px-6 h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all hover:-translate-x-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
              ) : (
                <div className="w-32" />
              )}

              <Button
                onClick={handleNext}
                disabled={loading}
                className="rounded-full px-8 h-12 bg-slate-900 text-white font-bold hover:bg-black transition-all hover:scale-105 shadow-md shadow-slate-900/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Guardando..." : (
                  <>
                    {user.role === "student" && step === 3 ? "Finalizar" : user.role === "employer" ? "Guardar y Empezar" : "Siguiente"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              {user.role === "student" && (
                <div className="hidden sm:block w-32" />
              )}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
