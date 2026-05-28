import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api-client";
import { DashboardNavbar } from "../widgets/navbar/ui/DashboardNavbar";
import { ReviewsList } from "../components/organisms/ReviewsList";
import {
  GraduationCap,
  Calendar,
  X,
  Loader2,
  Plus,
  Sparkles,
  Trophy,
  Trash2,
  Search
} from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import React from "react";

interface Profile {
  fullName: string;
  career: string;
  careerId?: string;
  academicCycle: number;
  universityName?: string;
  bio?: string;
  skills?: { name: string; level: number }[];
  gpa?: number;
  weekly_availability?: number;
  availability_blocks?: any;
}

interface CatalogSkill {
  id: string;
  name: string;
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

export function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<CatalogSkill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [editForm, setEditForm] = useState({
    bio: "",
    gpa: "",
    academicCycle: "1",
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

  const [skillForm, setSkillForm] = useState({
    name: "",
    level: 3
  });

  const parseAvailability = (raw: any) => {
    if (!raw) return null;
    let data = raw;
    if (typeof raw === 'string') {
      try { data = JSON.parse(raw); } catch (e) { return null; }
    }
    if (data && data.schedule && typeof data.schedule === 'object') {
      return data.schedule;
    }
    return data;
  };

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/profile/me");
      const data = response.data;
      const rawBlocks = data.availability_blocks || data.availabilityBlocks || data.availability || null;
      const parsedBlocks = parseAvailability(rawBlocks);

      const normalizedSkills = (data.skills || []).map((s: any) => ({
        ...s,
        level: s.proficiencyLevel || s.proficiency_level || s.level || 3
      }));

      setProfile({
        ...data,
        fullName: data.full_name || data.fullName,
        careerId: data.career_id || data.careerId,
        skills: normalizedSkills,
        availability_blocks: parsedBlocks,
        weekly_availability: data.weekly_availability || data.weeklyAvailability || 0
      });

      setEditForm({
        bio: data.bio || "",
        gpa: (data.gpa || 0).toString(),
        academicCycle: (data.academicCycle || data.academic_cycle || "1").toString(),
        availability: parsedBlocks || {
          mon: "0".repeat(32),
          tue: "0".repeat(32),
          wed: "0".repeat(32),
          thu: "0".repeat(32),
          fri: "0".repeat(32),
          sat: "0".repeat(32),
          sun: "0".repeat(32),
        }
      });
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const fetchSkills = async () => {
      try {
        const response = await apiClient.get("/profile/skills");
        const data = Array.isArray(response.data) ? response.data : (response.data?.skills || []);
        setAvailableSkills(data);
      } catch (err) {
        console.error("Error fetching catalog skills", err);
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Usamos PATCH /profile/me que ahora soporta skills y bloques de forma parcial
      await apiClient.patch("/profile/me", {
        bio: editForm.bio,
        gpa: parseFloat(editForm.gpa),
        academic_cycle: parseInt(editForm.academicCycle),
        availability_blocks: editForm.availability
      });
      await fetchProfile();
      setTimeout(() => { setShowEditModal(false); }, 1000);
    } catch {
      alert("Error al actualizar el perfil.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name || !profile) return;
    setUpdating(true);
    try {
      const currentSkills = (profile.skills || []).map(s => ({
        name: s.name,
        proficiency_level: s.level
      }));

      const updatedSkills = [...currentSkills, {
        name: skillForm.name,
        proficiency_level: skillForm.level
      }];

      // Ahora enviamos 'skill_inputs' al endpoint PATCH /profile/me
      await apiClient.patch("/profile/me", {
        skill_inputs: updatedSkills
      });

      setSkillForm({ name: "", level: 3 });
      setSkillSearch("");
      setShowSkillsModal(false);
      await fetchProfile();
    } catch (err) {
      alert("Error al añadir habilidad.");
    } finally {
      setUpdating(false);
    }
  };

  const removeSkill = async (skillName: string) => {
    if (!profile) return;
    try {
      const updatedSkills = (profile.skills || [])
        .filter(s => s.name !== skillName)
        .map(s => ({
          name: s.name,
          proficiency_level: s.level
        }));

      await apiClient.patch("/profile/me", {
        skill_inputs: updatedSkills
      });
      await fetchProfile();
    } catch {
      alert("Error al eliminar habilidad.");
    }
  };

  const toggleAvailability = (dayId: string, index: number) => {
    setEditForm(prev => {
      const currentBits = (prev.availability as any)[dayId].split("");
      currentBits[index] = currentBits[index] === "1" ? "0" : "1";
      return { ...prev, availability: { ...prev.availability, [dayId]: currentBits.join("") } };
    });
  };

  const filteredCatalogSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !(profile?.skills || []).some(s => s.name === skill.name)
  );

  const strength = (() => {
    if (!profile) return 0;
    let score = 40;
    if (profile.bio) score += 20;
    if (profile.gpa && profile.gpa > 0) score += 15;
    if (profile.skills && profile.skills.length > 3) score += 15;
    if (profile.academicCycle > 1) score += 10;
    return Math.min(score, 100);
  })();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Sparkles className="h-6 w-6 text-emerald-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      <DashboardNavbar role="student" />
      <main className="w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full h-full">
          {/* Columna Principal */}
          <div className="lg:col-span-8 2xl:col-span-9 border-r border-slate-100 p-6 md:p-10 lg:pl-16 pb-16 space-y-12 md:space-y-16">

            {/* Header Perfil */}
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                <div className="shrink-0 h-24 w-24 md:h-28 md:w-28 rounded-4xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                  <span className="text-3xl md:text-4xl font-black text-emerald-600">{profile?.fullName?.[0] || "U"}</span>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left w-full">
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                    <div className="w-full">
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight wrap-break-word">{profile?.fullName || "Usuario"}</h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-black border-emerald-200 text-emerald-600 uppercase tracking-widest bg-emerald-50/30">Perfil Verificado</Badge>
                        <span className="hidden md:inline text-xs font-bold text-slate-400">|</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{profile?.career}</span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setShowEditModal(true)} className="w-full md:w-auto rounded-xl border-slate-200 font-bold px-5 h-10 text-xs hover:bg-slate-50 hover:border-slate-300 transition-all">Editar Perfil</Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institución Educativa</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center justify-center md:justify-start gap-2 italic">
                        <GraduationCap className="h-4 w-4 text-emerald-500 shrink-0" /> {profile?.universityName || "Universidad Peruana"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado Académico</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center justify-center md:justify-start gap-2">
                        <Calendar className="h-4 w-4 text-emerald-500 shrink-0" /> {profile?.academicCycle || "1"}° Ciclo en curso
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Promedio General</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center justify-center md:justify-start gap-2">
                        <Trophy className="h-4 w-4 text-emerald-500 shrink-0" /> {profile?.gpa || "0.0"} GPA Académico
                      </p>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div className="pt-4">
                      <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                        <span className="text-emerald-500 font-black text-lg mr-1 leading-none">“</span>
                        {profile.bio}
                        <span className="text-emerald-500 font-black text-lg ml-1 leading-none">”</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="space-y-8 pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-6 gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Horario de Disponibilidad</h2>
                  <p className="text-xs font-bold text-slate-400">Define tus bloques libres para recibir propuestas de tareas.</p>
                </div>
                <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-slate-100 border border-slate-200" /> Ocupado</div>
                  <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" /> Disponible</div>
                </div>
              </div>
              <div className="overflow-x-auto pb-6 custom-scrollbar">
                <div className="grid grid-cols-8 gap-3 min-w-162.5">
                  <div />
                  {DAYS.map(day => <div key={day.id} className="text-center text-[10px] font-black text-slate-900 uppercase tracking-tighter pb-4">{day.label}</div>)}
                  <div className="col-span-8 space-y-2 h-100 overflow-y-auto pr-4 custom-scrollbar">
                    {TIME_SLOTS.map((time, idx) => (
                      <div key={time} className="grid grid-cols-8 gap-3 items-center">
                        <div className="text-[10px] font-black text-slate-300 text-right pr-2">{time}</div>
                        {DAYS.map(day => {
                          const blocks = profile?.availability_blocks || {};
                          const isAvailable = blocks[day.id]?.[idx] === "1";
                          return (
                            <div
                              key={`${day.id}-${idx}`}
                              className={cn(
                                "h-8 rounded-xl transition-all border border-slate-50",
                                isAvailable ? "bg-emerald-600 shadow-sm shadow-emerald-200" : "bg-slate-50/40"
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

            <h2 className="text-xl font-black text-slate-900 mt-4 mb-2">Mi Rendimiento</h2>
            {/* Componente de Reseñas */}
            {user?.id && <ReviewsList userId={user.id} role="student" />}


          </div>

          {/* Lateral - Sidebar Integrated */}
          <div className="lg:col-span-4 2xl:col-span-3 p-6 md:p-10 lg:pr-16 space-y-14 bg-slate-50/50 border-l border-slate-100">

            {/* Match de Mercado */}
            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center md:text-left">Match de Mercado</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1 w-full text-center md:text-left">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">88%</span>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nivel de Compatibilidad</p>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5"><div className="h-full bg-emerald-600 rounded-full w-[88%] shadow-sm" /></div>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed text-center md:text-left px-4 md:px-0">
                  Tu perfil es altamente demandado para micro-tareas de <span className="text-slate-900">{profile?.career}</span>.
                </p>
                <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-14 font-black text-sm shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5">Explorar Tareas</Button>
              </div>
            </div>

            {/* Habilidades - Flat List */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 md:border-none pb-4 md:pb-0">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mis Habilidades</h3>
                <Plus onClick={() => setShowSkillsModal(true)} className="h-5 w-5 text-emerald-600 cursor-pointer hover:scale-110 transition-transform bg-emerald-50 p-1 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(profile?.skills && profile.skills.length > 0 ? profile.skills : []).map((skill) => (
                  <div key={skill.name} className="space-y-3 group bg-white/50 md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-50 md:border-none">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 tracking-tight">{skill.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">{PROFICIENCY_LABELS[skill.level]}</span>
                        <Trash2 onClick={() => removeSkill(skill.name)} className="h-4 w-4 text-red-300 cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-all hover:text-red-500" />
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(skill.level / 5) * 100}%` }} /></div>
                  </div>
                ))}
                {(!profile?.skills || profile.skills.length === 0) && (
                  <div className="text-center py-6">
                    <p className="text-xs font-bold text-slate-300 italic">No has añadido habilidades aún.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nivel de Perfil */}
            {strength < 100 && (
              <div className="pt-6">
                <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-[2.5rem] space-y-6 text-center shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nivel de Perfil</p>
                  <div className="relative h-28 w-28 md:h-32 md:w-32 mx-auto">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="text-slate-50 stroke-current" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="16" fill="none" className="text-emerald-500 stroke-current" strokeWidth="2.5" strokeDasharray={`${strength}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{strength}%</span>
                      <span className="text-[8px] font-black text-emerald-600 uppercase mt-1 tracking-tighter">Fuerza</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 px-4 leading-relaxed italic">¡Tu perfil está listo para el mercado!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Añadir Habilidad - High Contrast & Mobile Ready */}
      {showSkillsModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">Añadir Habilidad</h2>
              <button onClick={() => setShowSkillsModal(false)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-300 hover:text-slate-500 transition-all shadow-sm"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-3" ref={suggestionRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecciona del Catálogo</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      setShowSuggestions(true);
                      setSkillForm({ ...skillForm, name: e.target.value });
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Ej: React, Figma, Python..."
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-100 bg-white font-black text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm"
                  />
                  {showSuggestions && skillSearch.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-55 overflow-y-auto py-2 custom-scrollbar">
                      {filteredCatalogSkills.length > 0 ? (
                        filteredCatalogSkills.map(skill => (
                          <button
                            key={skill.id}
                            onClick={() => {
                              setSkillForm({ ...skillForm, name: skill.name });
                              setSkillSearch(skill.name);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-6 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-slate-900 font-black text-sm">{skill.name}</span>
                            <Plus className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-3 text-slate-400 font-bold text-sm italic">Habilidad no encontrada</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nivel de Dominio</label>
                <div className="grid grid-cols-1 gap-2">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSkillForm({ ...skillForm, level: lvl })}
                      className={cn(
                        "w-full px-6 py-4 rounded-xl font-black text-xs transition-all flex justify-between items-center",
                        skillForm.level === lvl
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-[1.02]"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      <span>{PROFICIENCY_LABELS[lvl]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddSkill} disabled={updating || !skillForm.name} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black py-7 rounded-2xl text-sm transition-all active:scale-95 shadow-xl shadow-emerald-900/10 mb-4">
                {updating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Confirmar Habilidad"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal - Mobile Ready */}
      {showEditModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden h-full md:h-auto max-h-screen md:max-h-[90vh] flex flex-col border border-slate-200">
            <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Ajustes de Perfil</h2>
              <button onClick={() => setShowEditModal(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar flex-1">
              <form onSubmit={handleUpdateProfile} className="space-y-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Ciclo Académico</label>
                    <input type="number" value={editForm.academicCycle} onChange={(e) => setEditForm({ ...editForm, academicCycle: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-sm outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">GPA Académico</label>
                    <input type="number" step="0.1" value={editForm.gpa} onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-sm outline-none focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Sobre Mí (Bio)</label>
                  <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 h-28 resize-none text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Editar Disponibilidad</label>
                  <div className="bg-slate-50 p-4 rounded-2xl overflow-x-auto border border-slate-200">
                    <div className="grid grid-cols-8 gap-2 min-w-125">
                      <div />
                      {DAYS.map(day => <div key={day.id} className="text-[10px] font-black text-center text-slate-900">{day.label}</div>)}
                      <div className="col-span-8 h-62.5 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                        {TIME_SLOTS.map((time, idx) => (
                          <div key={time} className="grid grid-cols-8 gap-2 items-center">
                            <div className="text-[9px] font-black text-slate-400 text-right">{time}</div>
                            {DAYS.map(day => {
                              const isSelected = (editForm.availability as any)[day.id][idx] === "1";
                              return <div key={`${day.id}-${idx}`} onClick={() => toggleAvailability(day.id, idx)} className={cn("h-7 rounded-lg border-2 cursor-pointer transition-all", isSelected ? "bg-emerald-600 border-emerald-600 shadow-md scale-105" : "bg-white border-slate-200 hover:border-emerald-200")} />;
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updating} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 h-12 rounded-xl text-base transition-all active:scale-95 shadow-md">
                  {updating ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Guardar Cambios"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
