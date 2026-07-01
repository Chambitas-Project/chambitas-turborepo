import { Input, cn } from "@chambitas/ui";

interface EmployerProfileStepProps {
  employerData: any;
  setEmployerData: (data: any) => void;
}

export function EmployerProfileStep({
  employerData,
  setEmployerData,
}: EmployerProfileStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Nombre de Empresa / Organización <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Ej: TechStart Peru S.A.C."
          value={employerData.companyName}
          onChange={(e) => setEmployerData({ ...employerData, companyName: e.target.value })}
          className="h-12 border-slate-200 focus:border-indigo-500 bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Nombre de Contacto <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Tu nombre y apellidos"
          value={employerData.name}
          onChange={(e) => setEmployerData({ ...employerData, name: e.target.value })}
          className="h-12 border-slate-200 focus:border-indigo-500 bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
          <span>Descripción de la Empresa <span className="text-red-500">*</span></span>
          <span
            className={cn(
              "transition-colors",
              employerData.description.length < 20 ? "text-red-400" : "text-indigo-500"
            )}
          >
            {employerData.description.length}/500
          </span>
        </label>
        <textarea
          placeholder="¿A qué se dedican? ¿Por qué buscan talento joven?"
          value={employerData.description}
          onChange={(e) => setEmployerData({ ...employerData, description: e.target.value })}
          maxLength={500}
          className="w-full h-32 p-3 rounded-md border border-slate-200 bg-white text-sm focus:border-indigo-500 outline-none transition-colors resize-none"
        />
        <p className="text-[10px] text-slate-400 font-medium ml-1">Mínimo 20 caracteres.</p>
      </div>
    </div>
  );
}
