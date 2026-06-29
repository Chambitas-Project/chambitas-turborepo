import { useState, useEffect } from "react";
import { X, GraduationCap, Calendar, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@chambitas/ui";
import { employerApi } from "../../api/employer.api";
import { apiClient } from "../../api/api-client";
import { ReviewsList } from "./ReviewsList";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
}

const PROFICIENCY_LABELS: Record<number, string> = {
  1: 'Básico',
  2: 'Intermedio',
  3: 'Avanzado',
  4: 'Experto',
  5: 'Maestro'
};

const DAYS = [
  { id: 'mon', label: 'L' },
  { id: 'tue', label: 'M' },
  { id: 'wed', label: 'X' },
  { id: 'thu', label: 'J' },
  { id: 'fri', label: 'V' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'D' }
];

const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

export function StudentProfileModal({ isOpen, onClose, studentId }: StudentProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [skillsLoaded, setSkillsLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSkillsLoaded(false);
      apiClient.get('/profile/skills')
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : (res.data?.skills || []);
          setAvailableSkills(data);
        })
        .catch(err => console.error("Error fetching skills catalog", err))
        .finally(() => setSkillsLoaded(true));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      employerApi.getStudentProfile(studentId).then(res => {
        setProfile(res);
      }).catch(err => {
        console.error("Error fetching student profile", err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setProfile(null);
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const isSoftSkill = (skillName: string) => {
    const nameToMatch = (skillName || '').trim().toLowerCase();
    const cat = availableSkills.find(as => (as.name || '').trim().toLowerCase() === nameToMatch);
    return cat && (cat.type === 'soft' || cat.category === 'soft');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <style>{`
        .light-scrollbar::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .light-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 9999px !important;
        }
        .light-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }
      `}</style>
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Perfil del Estudiante</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto bg-white flex flex-col gap-8 light-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-400 font-bold">Cargando perfil...</p>
            </div>
          ) : !profile ? (
            <div className="text-center py-20">
              <p className="text-slate-500 font-medium">No se pudo cargar la información del estudiante.</p>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="h-28 w-28 rounded-full bg-slate-100 overflow-hidden shadow-sm shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name || profile.name || studentId}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="text-center md:text-left space-y-2 flex-1 pt-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{profile.full_name || profile.name || 'Estudiante'}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-emerald-500" /> {profile.careers?.name || profile.career || profile.career_name || profile.student_career || 'Carrera no especificada'}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-indigo-500" /> Ciclo {profile.academic_cycle || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" /> Sobre mí
                  </h4>
                  <p className="text-slate-700 font-medium leading-relaxed text-sm">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {(profile.skills && profile.skills.length > 0 && skillsLoaded) && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  {/* Habilidades Técnicas */}
                  {profile.skills.filter((s: any) => !isSoftSkill(s.name)).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilidades Técnicas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {profile.skills.filter((s: any) => !isSoftSkill(s.name)).map((s: any, idx: number) => (
                          <div key={idx} className="space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800 tracking-tight">{s.name || 'Habilidad'}</span>
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">{PROFICIENCY_LABELS[s.proficiency_level] || `Nivel ${s.proficiency_level}`}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(s.proficiency_level / 5) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Habilidades Blandas */}
                  {profile.skills.filter((s: any) => isSoftSkill(s.name)).length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Habilidades Blandas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {profile.skills.filter((s: any) => isSoftSkill(s.name)).map((s: any, idx: number) => (
                          <div key={idx} className="space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800 tracking-tight">{s.name || 'Habilidad'}</span>
                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">{PROFICIENCY_LABELS[s.proficiency_level] || `Nivel ${s.proficiency_level}`}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                              <div className="h-full bg-indigo-400 transition-all duration-700" style={{ width: `${(s.proficiency_level / 5) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Horario */}
              {profile.availability_blocks && (
                <div className="space-y-6 pt-6 border-t border-slate-100 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disponibilidad</h4>
                      <p className="text-xs font-medium text-slate-500">Horarios libres del estudiante.</p>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-slate-100 border border-slate-200" /> Ocupado</div>
                      <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-emerald-500 shadow-sm shadow-emerald-200" /> Disponible</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-8 gap-2 min-w-125">
                      <div />
                      {DAYS.map(day => <div key={day.id} className="text-center text-[9px] font-black text-slate-500 uppercase tracking-tighter pb-2">{day.label}</div>)}
                      <div className="col-span-8 space-y-1.5 max-h-62.5 overflow-y-auto pr-2 light-scrollbar">
                        {TIME_SLOTS.map((time, idx) => {
                          const blocksStr = profile.availability_blocks;
                          const blocksObj = typeof blocksStr === 'string' ? JSON.parse(blocksStr) : (blocksStr || {});
                          return (
                            <div key={time} className="grid grid-cols-8 gap-2 items-center">
                              <div className="text-[9px] font-black text-slate-400 text-right pr-2">{time}</div>
                              {DAYS.map(day => {
                                const isAvailable = blocksObj[day.id]?.[idx] === "1";
                                return (
                                  <div
                                    key={`${day.id}-${idx}`}
                                    className={cn(
                                      "h-6 rounded-md transition-all border",
                                      isAvailable ? "bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-100" : "bg-slate-50 border-slate-100"
                                    )}
                                  />
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {studentId && (
                <div className="pt-6 border-t border-slate-100 pb-4">
                  <ReviewsList userId={studentId} role="student" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
