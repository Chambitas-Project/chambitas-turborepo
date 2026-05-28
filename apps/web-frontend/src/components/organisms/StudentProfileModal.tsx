import { useState, useEffect } from "react";
import { X, GraduationCap, Calendar, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@chambitas/ui";
import { employerApi } from "../../api/employer.api";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
}

export function StudentProfileModal({ isOpen, onClose, studentId }: StudentProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">Perfil del Estudiante</h2>
          <button onClick={onClose} className="h-8 w-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 bg-[#F8FAFC]">
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
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="h-24 w-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-sm shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name || profile.name || studentId}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="text-center md:text-left space-y-2 flex-1">
                  <h3 className="text-2xl font-black text-slate-900">{profile.full_name || profile.name || 'Estudiante'}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-emerald-500" /> {profile.careers?.name || 'Carrera no especificada'}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-indigo-500" /> Ciclo {profile.academic_cycle || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" /> Sobre mí
                  </h4>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {(profile.student_skills && profile.student_skills.length > 0) && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-slate-900">Habilidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.student_skills.map((s: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold">
                        {s.skills?.name || 'Habilidad'}
                        <span className="ml-2 text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                          Lvl {s.proficiency_level}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
