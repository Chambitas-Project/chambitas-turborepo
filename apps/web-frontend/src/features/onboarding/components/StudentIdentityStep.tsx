import { Input, cn } from "@chambitas/ui";
import type { Career } from "../types";
import { AlertCircle, ChevronDown, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function SearchableCareerSelect({ 
  value, 
  onChange, 
  options 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: Career[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={cn(
          "w-full h-12 px-3 rounded-md border flex items-center justify-between bg-white text-sm cursor-pointer transition-colors", 
          isOpen ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-500"}>
          {selectedOption ? selectedOption.name : "Selecciona tu carrera..."}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen ? "rotate-180" : "")} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
          <div className="p-2 border-b border-slate-100 shrink-0 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar carrera..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-2 text-sm bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-emerald-500 text-slate-900"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-60 custom-scrollbar">
            {filteredOptions.length > 0 ? filteredOptions.map(o => (
              <div 
                key={o.id} 
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-900 transition-colors", 
                  value === o.id ? "bg-emerald-100 text-emerald-900 font-bold" : "text-slate-700"
                )}
                onClick={() => {
                  onChange(o.id);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                {o.name}
              </div>
            )) : (
              <div className="px-3 py-4 text-sm text-center text-slate-500">No se encontraron carreras</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
          placeholder="Ej. 936591720"
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
          <SearchableCareerSelect 
            value={studentData.careerId}
            onChange={(val) => setStudentData({ ...studentData, careerId: val })}
            options={availableCareers}
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
