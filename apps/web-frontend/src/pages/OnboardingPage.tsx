import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api-client";
import { Button, Input, Badge, cn } from "@chambitas/ui";
import { ChevronRight, ChevronLeft, Sparkles, GraduationCap, Building2, CheckCircle2 } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
}

export function OnboardingPage() {
  const { user, logout, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para Estudiante
  const [studentData, setStudentData] = useState({
    fullName: "",
    career: "",
    academicCycle: 1,
    gpa: 15.0,
    weeklyHours: 10,
    bio: "",
    skills: [] as string[]
  });

  // Estados para Empleador
  const [employerData, setEmployerData] = useState({
    companyName: "",
    ruc: "",
    sector: "",
    description: ""
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  useEffect(() => {
    if (user?.role === "student" && step === 3) {
      const fetchSkills = async () => {
        try {
          const response = await apiClient.get("/profile/skills");
          const skillsData = Array.isArray(response.data) ? response.data : [];
          setAvailableSkills(skillsData);
        } catch (err) {
          console.error("Error fetching skills:", err);
          setAvailableSkills([]);
        }
      };
      fetchSkills();
    }
  }, [user?.role, step]);

  // Validación por paso
  const isStepValid = () => {
    if (user?.role === "student") {
      if (step === 1) return studentData.fullName.trim().length > 3 && studentData.bio.trim().length > 10;
      if (step === 2) return studentData.career.trim().length > 3 && studentData.gpa >= 0 && studentData.gpa <= 20;
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
      setError("Por favor, completa todos los campos requeridos correctamente.");
      return;
    }
    setError(null);
    if (step < 3) setStep(s => s + 1);
    else user?.role === "student" ? handleStudentSubmit() : handleEmployerSubmit();
  };

  const handleStudentSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/profile/onboarding/student", {
        university_id: (user as any)?.university_id || (user as any)?.universityId,
        full_name: studentData.fullName,
        career: studentData.career,
        academic_cycle: Number(studentData.academicCycle),
        gpa: Number(studentData.gpa),
        weekly_availability: Number(studentData.weeklyHours),
        bio: studentData.bio,
        skill_inputs: studentData.skills.map(s => ({ name: s, proficiency_level: 3 }))
      });
      
      // Sincronizar estado con el servidor (según la guía)
      await refreshUser();
      window.location.assign("/");
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Error al completar onboarding. Inténtalo de nuevo.");
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

      // Sincronizar estado con el servidor (según la guía)
      await refreshUser();
      window.location.assign("/");
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.response?.data?.message || "Error al completar onboarding. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillName: string) => {
    setStudentData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillName)
        ? prev.skills.filter(s => s !== skillName)
        : prev.skills.length < 10 
          ? [...prev.skills, skillName]
          : prev.skills
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* Background decorativo integrado (Mobile First: menos prominente, Desktop: lateral) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-slate-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row">
                {/* Barra lateral de progreso (Más compacta) */}
        <aside className="w-full lg:w-72 bg-[#065f46] lg:min-h-screen p-6 lg:p-10 flex lg:flex-col justify-between text-white border-b lg:border-none border-white/10">
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
                {user?.role === "student" ? <GraduationCap className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </div>
              <h2 className="text-lg font-black tracking-tight">Onboarding</h2>
            </div>

            {/* Stepper responsivo más pequeño */}
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
                        ? (i === 1 ? "Identidad" : i === 2 ? "Academia" : "Skills")
                        : (i === 1 ? "Empresa" : i === 2 ? "Sector" : "Finalizar")
                      }
                    </span>
                  </div>
                </div>
              ))}
            </nav>
          </div>
          
          <button onClick={logout} className="hidden lg:block text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">
            Abandonar Proceso
          </button>
        </aside>

        {/* Área del Formulario más compacta */}
        <main className="flex-1 p-6 lg:p-16 flex flex-col justify-center max-w-4xl mx-auto w-full">
          <div className="max-w-lg w-full">
            <header className="mb-8">
              <div className="flex items-center gap-2 text-emerald-600 mb-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Bienvenido</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                {user.role === "student" ? (
                  step === 1 ? "¿Quién eres?" : step === 2 ? "¿Qué estudias?" : "Tus superpoderes"
                ) : (
                  step === 1 ? "Sobre la empresa" : step === 2 ? "Tu sector" : "Últimos pasos"
                )}
              </h1>
              <p className="mt-3 text-slate-500 font-medium text-base">
                Completa esta información para que nuestra IA encuentre las mejores oportunidades para ti.
              </p>
            </header>

            <div className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-center gap-3 animate-shake">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              {/* FORMULARIO ESTUDIANTE */}
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
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-6 duration-500">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Carrera Académica</label>
                        <Input 
                          placeholder="Ej: Ingeniería Industrial" 
                          className="h-12 rounded-xl border-slate-200 text-base font-medium"
                          value={studentData.career}
                          onChange={e => setStudentData({...studentData, career: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Promedio Ponderado</label>
                          <div className="relative">
                            <Input 
                              type="number" step="0.1" min="0" max="20"
                              className="h-12 rounded-xl border-slate-200 text-base font-black text-emerald-700 pl-4 pr-10"
                              value={studentData.gpa}
                              onChange={e => setStudentData({...studentData, gpa: Number(e.target.value)})}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                              <Sparkles className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ciclo</label>
                            <span className="text-xl font-black text-emerald-700">{studentData.academicCycle}</span>
                          </div>
                          <input 
                            type="range" min="1" max="12" 
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            value={studentData.academicCycle}
                            onChange={e => setStudentData({...studentData, academicCycle: Number(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.15em]">Horas Disponibles</label>
                            <p className="text-[10px] text-emerald-600 font-bold opacity-70">¿Cuánto tiempo dedicarás a microtrabajos?</p>
                          </div>
                          <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-black text-sm">
                            {studentData.weeklyHours}h
                          </div>
                        </div>
                        <input 
                          type="range" min="1" max="40" 
                          className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          value={studentData.weeklyHours}
                          onChange={e => setStudentData({...studentData, weeklyHours: Number(e.target.value)})}
                        />
                        <div className="flex justify-between text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          <span>1 hora</span>
                          <span>40 horas / sem</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilidades</label>
                         <Badge className="bg-emerald-100 text-emerald-700 font-black text-[10px]">{studentData.skills.length}/10</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 max-h-[260px] overflow-y-auto p-1 custom-scrollbar">
                        {Array.isArray(availableSkills) && availableSkills.map(skill => (
                          <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.name)}
                            className={cn(
                              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-2",
                              studentData.skills.includes(skill.name)
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105"
                                : "bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                            )}
                          >
                            {skill.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FORMULARIO EMPLEADOR */}
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

            {/* Acciones más compactas */}
            <footer className="mt-12 flex flex-col sm:flex-row-reverse items-center justify-between gap-4 border-t border-slate-100 pt-8">
              <Button 
                onClick={handleNext}
                disabled={loading}
                className={cn(
                  "w-full sm:w-auto px-7 h-11 rounded-xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-1.5",
                  isStepValid() 
                    ? "bg-[#065f46] text-white shadow-lg shadow-emerald-900/20 hover:scale-[1.02]" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                {loading ? "PROCESANDO..." : step === 3 ? "FINALIZAR" : "CONTINUAR"}
                <ChevronRight className="h-4 w-4" />
              </Button>

              {step > 1 ? (
                <button 
                  onClick={() => setStep(s => s - 1)}
                  className="w-full sm:w-auto h-11 px-6 text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" /> Volver atrás
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
