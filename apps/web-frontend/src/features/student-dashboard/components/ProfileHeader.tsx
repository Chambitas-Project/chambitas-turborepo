import { GraduationCap, Calendar, Trophy } from "lucide-react";
import { Badge, Button } from "@chambitas/ui";
import type { Profile } from "../types";

interface ProfileHeaderProps {
  profile: Profile | null;
  onEditClick: () => void;
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
        <div className="shrink-0 h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
          <span className="text-3xl md:text-4xl font-black text-emerald-600">
            {profile?.fullName?.[0] || "U"}
          </span>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
            <div className="w-full">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight wrap-break-word">
                {profile?.fullName || "Usuario"}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-black border-emerald-200 text-emerald-600 uppercase tracking-widest bg-emerald-50/30">
                  Perfil Verificado
                </Badge>
                <span className="hidden md:inline text-xs font-bold text-slate-400">|</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {profile?.career}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onEditClick}
              className="w-full md:w-auto rounded-md border-slate-200 font-bold px-5 h-10 text-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Editar Perfil
            </Button>
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
                <Trophy className="h-4 w-4 text-emerald-500 shrink-0" /> {profile?.gpa ? profile.gpa.toFixed(2) : "0.00"}
              </p>
            </div>
          </div>

          {profile?.bio && (
            <div className="pt-6 space-y-2 border-t border-slate-50 mt-6">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Biografía</h4>
              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
