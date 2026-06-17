import { Input, cn } from "@chambitas/ui";
import type { Career } from "../types";
import { AlertCircle } from "lucide-react";

interface StudentIdentityStepProps {
  studentData: any;
  setStudentData: (data: any) => void;
  availableCareers: Career[];
  careersError: boolean;
}

export function StudentIdentityStep({
  studentData,
  setStudentData,
  availableCareers,
  careersError,
}: StudentIdentityStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Nombre Completo
        </label>
        <Input
          placeholder="Tu nombre y apellidos"
          value={studentData.fullName}
          onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
          className="h-12 border-slate-200 focus:border-emerald-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
            <span>Carrera</span>
            {careersError && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Error al cargar
              </span>
            )}
          </label>
          <select
            value={studentData.careerId}
            onChange={(e) => setStudentData({ ...studentData, careerId: e.target.value })}
            className="w-full h-12 px-3 rounded-md border border-slate-200 bg-white text-sm focus:border-emerald-500 outline-none transition-colors"
          >
            <option value="">Selecciona tu carrera...</option>
            {availableCareers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Ciclo Actual
          </label>
          <select
            value={studentData.academicCycle}
            onChange={(e) =>
              setStudentData({ ...studentData, academicCycle: Number(e.target.value) })
            }
            className="w-full h-12 px-3 rounded-md border border-slate-200 bg-white text-sm focus:border-emerald-500 outline-none transition-colors"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cycle) => (
              <option key={cycle} value={cycle}>
                Ciclo {cycle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Promedio Ponderado (Referencial)
        </label>
        <div className="flex gap-2 items-center">
          <Input
            type="range"
            min="10"
            max="20"
            step="0.5"
            value={studentData.gpa}
            onChange={(e) => setStudentData({ ...studentData, gpa: Number(e.target.value) })}
            className="flex-1 accent-emerald-600"
          />
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-700">
            {studentData.gpa}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
          <span>Sobre ti</span>
          <span
            className={cn(
              "transition-colors",
              studentData.bio.length < 10 ? "text-red-400" : "text-emerald-500"
            )}
          >
            {studentData.bio.length}/500
          </span>
        </label>
        <textarea
          placeholder="Cuéntanos un poco sobre ti, qué te apasiona y qué buscas aprender..."
          value={studentData.bio}
          onChange={(e) => setStudentData({ ...studentData, bio: e.target.value })}
          maxLength={500}
          className="w-full h-32 p-3 rounded-md border border-slate-200 bg-white text-sm focus:border-emerald-500 outline-none transition-colors resize-none"
        />
        <p className="text-[10px] text-slate-400 font-medium ml-1">Mínimo 10 caracteres.</p>
      </div>
    </div>
  );
}
