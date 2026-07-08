import { Input, cn } from "@chambitas/ui";
import type { Career } from "../types";
import { AlertCircle } from "lucide-react";
import { SearchableSelect } from "../../../components/molecules/SearchableSelect";


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
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Tu nombre y apellidos"
          value={studentData.fullName}
          onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
          className="h-12 border-slate-200 focus:border-emerald-500 bg-white text-slate-900"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
          <span>Número de Celular <span className="text-red-500">*</span></span>
          <span className="text-[10px] text-slate-400 normal-case font-medium tracking-normal">Privado (solo para tu empleador cuando te acepte)</span>
        </label>
        <Input
          type="tel"
          placeholder="Ej. 987654321"
          value={studentData.phoneNumber}
          onChange={(e) => setStudentData({ ...studentData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
          className={cn(
            "h-12 border bg-white text-slate-900",
            studentData.phoneNumber && (studentData.phoneNumber.length !== 9 || !studentData.phoneNumber.startsWith('9'))
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          )}
        />
        {studentData.phoneNumber && (studentData.phoneNumber.length !== 9 || !studentData.phoneNumber.startsWith('9')) && (
          <p className="text-[10px] text-red-500 font-medium mt-1">Debe tener 9 dígitos y empezar con 9.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
            <span>Carrera <span className="text-red-500">*</span></span>
            {careersError && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Error al cargar
              </span>
            )}
          </label>
          <SearchableSelect
            value={studentData.careerId}
            onChange={(val) => {
              setStudentData((prev: any) => ({ ...prev, careerId: val }));
            }}
            options={availableCareers}
            placeholder="Selecciona tu carrera..."
            searchPlaceholder="Buscar carrera..."
            noOptionsText="No se encontraron carreras"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Ciclo Actual <span className="text-red-500">*</span>
          </label>
          <select
            value={studentData.academicCycle}
            onChange={(e) =>
              setStudentData({ ...studentData, academicCycle: Number(e.target.value) })
            }
            className="w-full h-12 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 focus:border-emerald-500 outline-none transition-colors"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cycle) => (
              <option key={cycle} value={cycle} className="text-slate-900 bg-white">
                Ciclo {cycle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Promedio Ponderado (Referencial) <span className="text-red-500">*</span>
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
          <span>Sobre ti <span className="text-red-500">*</span></span>
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
          className="w-full h-32 p-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 focus:border-emerald-500 outline-none transition-colors resize-none"
        />
        <p className="text-[10px] text-slate-400 font-medium ml-1">Mínimo 10 caracteres.</p>
      </div>
    </div>
  );
}
