import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api-client";
import { Button, Input, Badge, cn } from "@chambitas/ui";
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  Search, 
  X, 
  Star,
  Clock,
  Info,
  Plus,
  AlertCircle,
  BookOpen
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Career {
  id: string;
  name: string;
  area: string;
}

interface SelectedSkill {
  name: string;
  proficiency_level: number;
}

const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Principiante",
  2: "Básico",
  3: "Intermedio",
  4: "Avanzado",
  5: "Experto"
};

const DAYS = [
  { id: "mon", label: "LUN" },
  { id: "tue", label: "MAR" },
  { id: "wed", label: "MIÉ" },
  { id: "thu", label: "JUE" },
  { id: "fri", label: "VIE" },
  { id: "sat", label: "SÁB" },
  { id: "sun", label: "DOM" },
];

const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

const DEFAULT_UNIVERSITY_ID = "59a91332-e18f-4e68-8061-fe83f4c7610f";

export function OnboardingPage() {
  const { user, logout, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState(false);
  const [careersError, setCareersError] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Estados para Estudiante
  const [studentData, setStudentData] = useState({
    fullName: "",
    careerId: "",
    academicCycle: 1,
    gpa: 15.0,
    bio: "",
    skills: [] as SelectedSkill[],
    availability: {
      mon: "0".repeat(32),
      tue: "0".repeat(32),
      wed: "0".repeat(32),
      thu: "0".repeat(32),
      fri: "0".repeat(32),
      sat: "0".repeat(32),
      sun: "0".repeat(32),
    }
  });

  // Estados para Empleador
  const [employerData, setEmployerData] = useState({
    companyName: "",
    ruc: "",
    sector: "",
    description: ""
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableCareers, setAvailableCareers] = useState<Career[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        // Fetch Skills
        const skillsResponse = await apiClient.get("/profile/skills");
        const skillsData = Array.isArray(skillsResponse.data) ? skillsResponse.data : (skillsResponse.data?.skills || []);
        setAvailableSkills(skillsData);
        setSkillsError(false);
      } catch (err: any) {
        console.error("Error fetching skills:", err);
        setSkillsError(true);
      }

      try {
        // Fetch Careers filtradas por universidad
        const careersResponse = await apiClient.get(`/profile/careers?university_id=${DEFAULT_UNIVERSITY_ID}`);
        const careersData = Array.isArray(careersResponse.data) ? careersResponse.data : (careersResponse.data?.careers || []);
        setAvailableCareers(careersData);
        setCareersError(false);
      } catch (err: any) {
        console.error("Error fetching careers:", err);
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

  const filteredSkills = availableSkills.filter(skill => 
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !studentData.skills.some(s => s.name === skill.name)
  );

  const calculateTotalHours = () => {
    const totalBits = Object.values(studentData.availability)
      .join("")
      .split("")
      .filter(bit => bit === "1").length;
    return totalBits * 0.5;
  };

  const isStepValid = () => {
    if (user?.role === "student") {
      if (step === 1) return studentData.fullName.trim().length > 3 && studentData.bio.trim().length > 10 && studentData.careerId !== "";
      if (step === 2) return studentData.gpa >= 0 && studentData.gpa <= 20 && calculateTotalHours() >= 4;
      if (step === 3) return studentData.skills.length >= 3;
    } else {
      if (step === 1) return employerData.companyName.trim().length > 2 && employerData.ruc.length === 11;
      if (step === 2) return employerData.sector.trim().length > 2;
      if (step === 3) return employerData.description.trim().length > 20;
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      if (user?.role === "student" && step === 1 && studentData.careerId === "") {
        setError("Por favor, selecciona tu carrera académica del catálogo.");
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
    if (step < 3) {
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
      window.location.assign("/");
    } catch (err: any) {
      console.error("Submission error details:", err.response?.data || err);
      if (err.response?.status === 500) {
          setError("Error interno del servidor (500). Verifica que tu carrera y habilidades sean válidas.");
      } else if (err.response?.status === 503) {
          setError("El servicio de perfiles está temporalmente inactivo (Circuit Open). Por favor, espera un minuto e inténtalo de nuevo.");
      } else if (err.response?.status === 400) {
          const details = Array.isArray(err.response.data.message) 
            ? err.response.data.message.join(", ") 
            : err.response.data.message;
          setError(`Error de validación: ${details}`);
      } else if (err.response?.status === 401) {
        setError("Error de autenticación: Tu sesión ha expirado. Por favor, re-loguea.");
      } else {
        setError(err.response?.data?.message || "Error al completar onboarding. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/profile/onboarding/employer", {
        company_name: employerData.companyName,
        ruc: employerData.ruc,
        sector: employerData.sector,
        description: employerData.description
      });

      await refreshUser();
      window.location.assign("/");
    } catch (err: any) {
      console.error("Submission error:", err);
      if (err.response?.status === 401) {
        setError("Error de autenticación: Tu sesión ha expirado. Por favor, re-loguea.");
      } else {
        setError(err.response?.data?.message || "Error al completar onboarding. Inténtalo de nuevo.");
      }
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
        availability: {
          ...prev.availability,
          [dayId]: currentBits.join("")
        }
      };
    });
  };

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (studentData.skills.length >= 10) return;
    
    // Solo permitir si está en el catálogo
    const exists = availableSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) return;

    // Check if skill already added
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
        <aside className="w-full lg:w-72 bg-[#065f46] lg:min-h-screen p-6 lg:p-10 flex lg:flex-col justify-between text-white border-b lg:border-none border-white/10">
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
                {user?.role === "student" ? <GraduationCap className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </div>
              <h2 className="text-lg font-black tracking-tight">Onboarding</h2>
            </div>

            <nav className="flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn(
                  "flex items-center gap-3 shrink-0 transition-all duration-300",
                  step < i ? "opacity-30 scale-95" : "opacity-100 scale-100"
                )}>
                  <div className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition-all",
                    step === i ? "bg-white text-emerald-900 shadow-lg shadow-black/20" : "bg-white/10 text-white border border-white/20"
                  )}>
                    {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Paso {i}</span>
                    <span className="text-xs font-bold">
                      {user?.role === "student" 
                        ? (i === 1 ? "Identidad" : i === 2 ? "Disponibilidad" : "Skills")
                        : (i === 1 ? "Empresa" : i === 2 ? "Sector" : "Finalizar")
                      }
                    </span>
                  </div>
                </div>
              ))}
            </nav>
          </div>
          
          <button onClick={logout} className="hidden lg:block text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">
            Cerrar Sesión
          </button>
        </aside>

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
                  step === 1 ? "Sobre la empresa" : step === 2 ? "Tu sector" : "Últimos pasos"
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
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                        <Input 
                          placeholder="Tu nombre y apellidos" 
                          className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/10 text-base font-medium"
                          value={studentData.fullName}
                          onChange={e => setStudentData({...studentData, fullName: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Carrera Académica</label>
                        <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 z-10" />
                          <select 
                            className={cn(
                              "w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-base font-black appearance-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all",
                              studentData.careerId === "" ? "text-slate-300" : "text-slate-900"
                            )}
                            value={studentData.careerId}
                            onChange={e => setStudentData({...studentData, careerId: e.target.value})}
                          >
                            <option value="">{careersError ? "No se pudo cargar el catálogo" : "Selecciona tu carrera..."}</option>
                            {availableCareers.map(career => (
                              <option key={career.id} value={career.id} className="text-slate-900 font-bold">{career.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                          </div>
                        </div>
                        {careersError && (
                          <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1 mt-1 ml-1">
                            <AlertCircle className="h-3 w-3" />
                            Error de conexión. Intenta re-loguear para ver las carreras.
                          </span>
                        )}
                      </div>

                      {/* Sección de Promedio Ponderado (GPA) */}
                      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-emerald-200 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:bg-emerald-100 transition-colors" />
                        
                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                                <Star className="h-5 w-5 text-white fill-white" />
                              </div>
                              <h3 className="text-xl font-black text-slate-900 tracking-tight">Tu Rendimiento Académico</h3>
                            </div>
                            
                            <div className="space-y-3">
                              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                El <span className="text-emerald-700">Promedio Ponderado (GPA)</span> refleja tu desempeño general. 
                                Las empresas utilizan este dato para validar tu compromiso y excelencia en tus estudios.
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                                <Info className="h-3 w-3 text-emerald-500" />
                                Rango permitido: 0.0 a 20.0
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-center gap-3">
                            <div className="relative group/input">
                              <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="20"
                                className="h-24 w-40 rounded-3xl border-4 border-slate-100 bg-slate-50/50 text-center font-black text-4xl text-emerald-700 focus:border-emerald-500 focus:bg-white outline-none transition-all hover:border-slate-200"
                                value={studentData.gpa}
                                onChange={e => setStudentData({...studentData, gpa: Number(e.target.value)})}
                              />
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity whitespace-nowrap">
                                PUNTAJE ACTUAL
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROMEDIO ACTUAL</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sobre ti (Bio)</label>
                          <span className={cn(
                            "text-[10px] font-bold",
                            studentData.bio.length > 450 ? "text-amber-500" : "text-slate-300"
                          )}>
                            {studentData.bio.length}/500
                          </span>
                        </div>
                        <textarea 
                          maxLength={500}
                          className="w-full min-h-[120px] rounded-xl border border-slate-200 p-4 text-base font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                          placeholder="Cuéntanos un poco sobre tus intereses..."
                          value={studentData.bio}
                          onChange={e => setStudentData({...studentData, bio: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Clock className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Disponibilidad Semanal</p>
                            <p className="text-xl font-black text-emerald-900">{calculateTotalHours()} Horas Libres</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-emerald-600" />
                              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Horas disponibles a trabajar</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-slate-100" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ocupado / Clases</span>
                           </div>
                        </div>
                      </div>


                      {/* Grilla de Disponibilidad */}
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 overflow-x-auto">
                        <div className="grid grid-cols-8 gap-2 min-w-[600px]">
                          <div />
                          {DAYS.map(day => (
                            <div key={day.id} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4">{day.label}</div>
                          ))}

                          <div className="col-span-8 h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {TIME_SLOTS.map((time, idx) => (
                              <div key={time} className="grid grid-cols-8 gap-2 items-center">
                                <div className="text-[10px] font-black text-slate-400 text-right pr-2">{time}</div>
                                {DAYS.map(day => {
                                  const isSelected = (studentData.availability as any)[day.id][idx] === "1";
                                  return (
                                    <button
                                      key={`${day.id}-${idx}`}
                                      onClick={() => toggleAvailability(day.id, idx)}
                                      className={cn(
                                        "h-8 rounded-lg border-2 transition-all duration-200",
                                        isSelected 
                                          ? "bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-900/20 scale-105" 
                                          : "bg-slate-50 border-transparent hover:border-emerald-200"
                                      )}
                                    />
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Busca tus Habilidades</label>
                            {skillsError && (
                                <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    No se pudo cargar el catálogo. Por favor, re-loguea.
                                </span>
                            )}
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 font-black text-[10px]">{studentData.skills.length}/10</Badge>
                        </div>
                        
                        <div className="relative" ref={suggestionRef}>
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <Input 
                              placeholder="Ej: React, Python, Diseño..."
                              className="h-14 pl-12 rounded-2xl border-slate-200 shadow-sm focus:ring-emerald-500/10 text-base font-black"
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
                            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[240px] overflow-y-auto py-2 custom-scrollbar">
                              {filteredSkills.length > 0 ? (
                                <>
                                  {filteredSkills.map(skill => (
                                    <button
                                      key={skill.id}
                                      onClick={() => addSkill(skill.name)}
                                      className="w-full px-6 py-3 text-left hover:bg-emerald-50 hover:text-emerald-700 font-black transition-colors text-sm flex items-center justify-between group"
                                    >
                                      <span>{skill.name}</span>
                                      <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                  ))}
                                </>
                              ) : (
                                <div className="px-6 py-3 text-slate-400 font-bold text-sm italic">
                                  No se encontraron resultados en el catálogo.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lista de Skills Seleccionadas */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilidades Seleccionadas</label>
                        {studentData.skills.length === 0 ? (
                          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                            <p className="text-slate-400 font-black text-sm">Selecciona al menos 3 habilidades del catálogo.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {studentData.skills.map((skill) => (
                              <div key={skill.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all group">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Star className="h-5 w-5 text-emerald-600 fill-emerald-600" />
                                  </div>
                                  <span className="font-black text-slate-800">{skill.name}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <button
                                        key={level}
                                        onClick={() => updateProficiency(skill.name, level)}
                                        className={cn(
                                          "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center min-w-[56px]",
                                          skill.proficiency_level === level 
                                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" 
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white"
                                        )}
                                      >
                                        <span>{level}</span>
                                        <span className="text-[7px] leading-none opacity-80">{PROFICIENCY_LABELS[level]}</span>
                                      </button>
                                    ))}
                                  </div>
                                  <button 
                                    onClick={() => removeSkill(skill.name)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user.role === "employer" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Empresa</label>
                        <Input 
                          placeholder="Ej: Chambitas S.A.C." 
                          className="h-12 rounded-xl border-slate-200 text-base font-medium"
                          value={employerData.companyName}
                          onChange={e => setEmployerData({...employerData, companyName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RUC</label>
                        <Input 
                          placeholder="20XXXXXXXXX" 
                          maxLength={11}
                          className="h-12 rounded-xl border-slate-200 text-base font-medium"
                          value={employerData.ruc}
                          onChange={e => setEmployerData({...employerData, ruc: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector</label>
                      <Input 
                        placeholder="Ej: Tecnología" 
                        className="h-12 rounded-xl border-slate-200 text-base font-medium"
                        value={employerData.sector}
                        onChange={e => setEmployerData({...employerData, sector: e.target.value})}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</label>
                        <span className={cn(
                          "text-[10px] font-bold",
                          employerData.description.length > 450 ? "text-amber-500" : "text-slate-300"
                        )}>
                          {employerData.description.length}/500
                        </span>
                      </div>
                      <textarea 
                        maxLength={500}
                        className="w-full min-h-[140px] rounded-xl border border-slate-200 p-4 text-base font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        placeholder="Cuéntanos sobre tu empresa..."
                        value={employerData.description}
                        onChange={e => setEmployerData({...employerData, description: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="mt-12 flex flex-col sm:flex-row-reverse items-center justify-between gap-4 border-t border-slate-100 pt-8 pb-12">
              <Button 
                onClick={handleNext}
                disabled={loading}
                className={cn(
                  "w-full sm:w-auto px-10 h-14 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-1.5",
                  isStepValid() 
                    ? "bg-[#065f46] text-white shadow-xl shadow-emerald-900/20 hover:scale-[1.02]" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                {loading ? "PROCESANDO..." : step === 3 ? "FINALIZAR" : "CONTINUAR"}
                <ChevronRight className="h-5 w-5" />
              </Button>

              {step > 1 ? (
                <button 
                  onClick={() => setStep(s => s - 1)}
                  className="w-full sm:w-auto h-14 px-8 text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ChevronLeft className="h-5 w-5" /> Volver atrás
                </button>
              ) : (
                <div className="hidden sm:block w-32" />
              )}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
