import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api-client";
import {
  GraduationCap,
  Calendar,
  Star,
  TrendingUp,
  ChevronRight,
  Briefcase,
  ClipboardList,
  LogOut,
  User,
  X,
  Loader2,
  Plus,
  Sparkles
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, cn } from "@chambitas/ui";
import React from "react";

interface Profile {
  fullName: string;
  career: string;
  academicCycle: number;
  universityName?: string;
  bio?: string;
  skills?: { name: string; level: number }[];
  gpa?: number;
  weekly_availability?: number;
}

export function StudentDashboard() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    bio: string, 
    gpa: string, 
    academicCycle: string, 
    availability: Record<number, number[]>
  }>({ 
    bio: "", 
    gpa: "", 
    academicCycle: "1", 
    availability: {} 
  });

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/profile/me");
      setProfile(response.data);
      setEditForm({
        bio: response.data.bio || "",
        gpa: response.data.gpa?.toString() || "",
        academicCycle: response.data.academicCycle?.toString() || "1",
        availability: response.data.availability_blocks?.schedule || {}
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Calcular horas totales (cada bloque son 2 horas)
      const totalHours = Object.values(editForm.availability).flat().filter(v => v).length * 2;
      
      await apiClient.patch("/profile/me", {
        bio: editForm.bio,
        gpa: parseFloat(editForm.gpa),
        academic_cycle: parseInt(editForm.academicCycle),
        availability_blocks: {
          schedule: editForm.availability,
          total_hours: totalHours
        }
      });
      
      setSuccessMessage("¡Perfil actualizado con éxito!");
      await fetchProfile();
      setTimeout(() => {
        setShowEditModal(false);
        setSuccessMessage(null);
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error al actualizar el perfil. Por favor, intenta de nuevo.");
    } finally {
      setUpdating(false);
    }
  };

  // Toggle de disponibilidad en el modal
  const toggleAvailability = (day: number, hour: number) => {
    const current = editForm.availability[day] || [];
    const isOpen = current.includes(hour);
    const updated = isOpen 
      ? current.filter(h => h !== hour)
      : [...current, hour];
    
    setEditForm({
      ...editForm,
      availability: { ...editForm.availability, [day]: updated }
    });
  };

  // Cálculo dinámico de fortaleza del perfil
  const calculateStrength = () => {
    if (!profile) return 0;
    let score = 40; // Base por tener cuenta
    if (profile.bio) score += 20;
    if (profile.gpa && profile.gpa > 0) score += 15;
    if (profile.skills && profile.skills.length > 3) score += 15;
    if (profile.academicCycle > 1) score += 10;
    return Math.min(score, 100);
  };

  const strength = calculateStrength();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Panel...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-12 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar (Compact) */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tighter text-emerald-700">Chambitas</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-bold text-slate-500">
              <button className="hover:text-emerald-600 transition-colors">Buscar Empleos</button>
              <button className="hover:text-emerald-600 transition-colors">Mis Tareas</button>
              <button className="hover:text-emerald-600 transition-colors">Mensajes</button>
              <button className="text-emerald-600 border-b-2 border-emerald-600">Panel</button>
          </div>
          <div className="flex items-center gap-4 relative">
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900">Ayuda</button>
            <div 
              className="h-10 w-10 rounded-full bg-emerald-50 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-200 transition-all"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName}`} alt="Avatar" />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-14 right-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                <button 
                  onClick={() => { setShowEditModal(true); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                >
                  <User className="h-4 w-4" /> Mi Perfil
                </button>
                <div className="h-px bg-slate-100 mx-2 my-1" />
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMNA IZQUIERDA (8 col) */}
          <div className="lg:col-span-8 space-y-6">
            
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative shrink-0">
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-1 shadow-2xl">
                      <div className="h-full w-full rounded-[1.25rem] bg-white flex items-center justify-center">
                        <span className="text-3xl font-black text-emerald-600">{profile?.fullName?.[0] || "U"}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-50 rounded-xl border-2 border-white flex items-center justify-center shadow-sm">
                      <Star className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.fullName || "Usuario"}</h1>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Perfil Académico Verificado</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setShowEditModal(true)} className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 h-9 text-xs">
                          Editar Perfil
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-100 font-black h-9 text-xs">
                          Mi CV
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-slate-800 font-black text-base">
                        <GraduationCap className="h-5 w-5 text-emerald-600" />
                        {profile?.universityName || "Universidad No Especificada"}
                      </p>
                      <p className="text-slate-600 font-bold text-sm">Estudiante de <span className="text-emerald-700 font-black underline decoration-emerald-200 underline-offset-4">{profile?.career}</span></p>
                      {profile?.bio ? (
                        <p className="text-slate-700 text-sm mt-2 line-clamp-3 max-w-lg leading-relaxed font-medium">
                          {profile.bio}
                        </p>
                      ) : (
                        <button onClick={() => setShowEditModal(true)} className="text-xs text-emerald-600 font-black hover:underline mt-2 flex items-center gap-2">
                          <Plus className="h-3 w-3" /> Añadir biografía
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-slate-100 shadow-sm">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-black text-slate-900">{profile?.academicCycle || "1"}° Ciclo</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-slate-100 shadow-sm">
                        <Star className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                        <span className="text-sm font-black text-slate-900">{profile?.gpa || "0.0"} GPA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disponibilidad Semanal (Compact) */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-xl font-black text-slate-900">Disponibilidad</CardTitle>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-slate-100 border border-slate-200" /> Ocupado</div>
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" /> Disponible ({profile?.weekly_availability || 0}h)</div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="grid grid-cols-6 gap-2">
                  <div />
                  {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'].map(day => (
                    <div key={day} className="text-center text-[9px] font-black text-slate-900 tracking-widest pb-2">{day}</div>
                  ))}

                  {[8, 10, 12, 14, 16].map(hour => (
                    <React.Fragment key={hour}>
                      <div className="text-[10px] font-black text-slate-900 flex items-center justify-end pr-2 italic">{hour}:00</div>
                      {[1, 2, 3, 4, 5].map(day => {
                        const isAvailable = (profile as any)?.availability_blocks?.schedule?.[day]?.includes(hour);
                        return (
                          <div
                            key={`${day}-${hour}`}
                            className={cn(
                              "h-10 rounded-xl border-2 transition-all flex items-center justify-center",
                              !isAvailable
                                ? "bg-slate-50 border-slate-100 opacity-40"
                                : "bg-emerald-50 border-emerald-500 shadow-sm hover:bg-emerald-100 cursor-pointer"
                            )}
                          >
                            {isAvailable && <Briefcase className="h-3 w-3 text-emerald-700" />}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historial Académico */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cursos Actuales</h2>
                <button className="text-sm font-black text-emerald-700 flex items-center gap-1 hover:underline bg-emerald-50 px-3 py-1 rounded-lg">
                  Ver más <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-[6px] border-l-emerald-600 shadow-md rounded-[2rem] overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-lg font-black text-slate-900">Ciclo {profile?.academicCycle || "Actual"}</p>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Status Académico</p>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-sm">ESTUDIANDO</Badge>
                    </div>
                    <div className="space-y-4">
                      {[
                        { n: "Universidad", c: profile?.universityName || "UPC" },
                        { n: "Carga Horaria", c: `${profile?.weekly_availability || 0}h / semana` }
                      ].map(course => (
                        <div key={course.n} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-none">
                          <span className="font-black text-slate-500 uppercase text-[10px] tracking-widest">{course.n}</span>
                          <span className="font-black text-slate-900">{course.c}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA (4 col) */}
          <div className="lg:col-span-4 space-y-8">

            {/* Match de Mercado (Compact) */}
            <Card className="bg-white border-2 border-emerald-100 shadow-xl shadow-emerald-600/5 rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 text-emerald-900">
                <TrendingUp className="h-24 w-24" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <h3 className="text-xl font-black leading-tight text-emerald-900 tracking-tight">Match de Mercado</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  Basado en tus <span className="text-emerald-700 font-bold underline decoration-emerald-200">{profile?.skills?.length || 0} habilidades</span>, tienes una alta probabilidad de empleabilidad.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probabilidad</span>
                    <span className="text-2xl font-black text-emerald-600">88%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-[88%] shadow-sm" />
                  </div>
                </div>
                <Button className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black py-5 rounded-2xl shadow-lg border-none text-sm transition-all hover:scale-[1.02]">
                  Ver Oportunidades
                </Button>
              </CardContent>
            </Card>

            {/* Habilidades Técnicas (Compact) */}
            <Card className="border-none shadow-sm rounded-3xl bg-white">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
                  <ClipboardList className="h-5 w-5 text-emerald-600" /> Mis Habilidades
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
                {(profile?.skills && profile.skills.length > 0 ? profile.skills : [
                  { name: "Sin Habilidades", level: 1 }
                ]).map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-800">{skill.name}</span>
                      <span className="font-black text-emerald-600 uppercase text-[9px] tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                        {skill.level === 5 ? "Experto" : skill.level === 4 ? "Avanzado" : skill.level === 3 ? "Intermedio" : "Básico"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fortaleza del Perfil (Compact) */}
            <Card className="border-none shadow-sm rounded-3xl bg-emerald-50/50 border border-emerald-100">
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fortaleza del Perfil</p>
                <div className="relative h-28 w-28 mx-auto">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path className="text-white stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-600 stroke-current" strokeDasharray={`${strength}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-emerald-900">{strength}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-black text-emerald-900 text-sm">
                    {strength === 100 ? "¡Perfil Completado!" : "Perfil en Progreso"}
                  </p>
                  <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-white py-1 px-3 rounded-full shadow-sm inline-block">
                    {strength === 100 ? "Listo para chambear" : "Faltan datos"}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* Modal de Edición de Perfil (EXPANDIDO) */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-10 bg-slate-50/50">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Editar Mi Perfil</CardTitle>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Manten tus datos actualizados</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-red-50 hover:text-red-500 transition-all text-slate-400">
                <X className="h-6 w-6" />
              </button>
            </CardHeader>
            <CardContent className="p-10 overflow-y-auto space-y-10">
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                
                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl font-black text-sm animate-bounce flex items-center gap-3">
                    <Star className="h-5 w-5 fill-emerald-600" />
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Ciclo Académico</label>
                    <div className="relative group">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 group-focus-within:scale-110 transition-transform" />
                      <input 
                        type="number"
                        min="1"
                        max="12"
                        value={editForm.academicCycle}
                        onChange={(e) => setEditForm({...editForm, academicCycle: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 rounded-[1.25rem] border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 text-base font-black bg-white transition-all text-slate-900 placeholder:text-slate-500"
                        placeholder="Ej: 9"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Promedio (GPA)</label>
                    <div className="relative group">
                      <Star className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 group-focus-within:scale-110 transition-transform" />
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={editForm.gpa}
                        onChange={(e) => setEditForm({...editForm, gpa: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 rounded-[1.25rem] border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 text-base font-black bg-white transition-all text-slate-900 placeholder:text-slate-500"
                        placeholder="Ej: 16.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2">Biografía Profesional</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full h-32 rounded-[1.25rem] border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 text-base font-bold p-6 bg-white resize-none transition-all text-slate-900 placeholder:text-slate-500"
                    placeholder="Escribe algo sobre ti para que los empleadores te conozcan mejor..."
                  />
                </div>

                {/* Grid de Disponibilidad */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">Disponibilidad Semanal</label>
                    <Badge className="bg-emerald-600 text-white border-none font-black text-xs px-4 py-1.5 rounded-full shadow-md">
                      {Object.values(editForm.availability).flat().length * 2} Horas Libres
                    </Badge>
                  </div>
                  <div className="grid grid-cols-6 gap-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div />
                    {['L', 'M', 'X', 'J', 'V'].map(day => (
                      <div key={day} className="text-center text-xs font-black text-slate-900">{day}</div>
                    ))}
                    {[8, 10, 12, 14, 16].map(hour => (
                      <React.Fragment key={hour}>
                        <div className="text-[10px] font-black text-slate-500 flex items-center justify-end pr-3">{hour}:00</div>
                        {[1, 2, 3, 4, 5].map(day => {
                          const isSelected = editForm.availability[day]?.includes(hour);
                          return (
                            <div
                              key={`${day}-${hour}`}
                              onClick={() => toggleAvailability(day, hour)}
                              className={cn(
                                "h-12 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center",
                                isSelected 
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105"
                                  : "bg-white border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30"
                              )}
                            >
                              {isSelected && <Briefcase className="h-4 w-4" />}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updating}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black py-8 rounded-[1.5rem] shadow-2xl border-none flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 text-lg"
                >
                  {updating ? <Loader2 className="h-6 w-6 animate-spin" /> : "Guardar Cambios del Perfil"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}


