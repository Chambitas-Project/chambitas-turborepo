import { cn } from "../utils"

interface RoleSelectorProps {
  role: string;
  onChange: (role: string) => void;
  className?: string;
}

export function RoleSelector({ role, onChange, className }: RoleSelectorProps) {
  return (
    <div 
      className={cn(
        "relative p-1 rounded-2xl flex border border-slate-200/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] h-14 items-center", 
        "bg-slate-100/80 backdrop-blur-sm",
        className
      )}
    >
      {/* Píldora animada de fondo */}
      <div 
        className={cn(
          "absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          role === "student" ? "translate-x-0" : "translate-x-full"
        )}
      />

      {/* Botón Estudiante */}
      <button 
        type="button"
        onClick={() => onChange("student")}
        className={cn(
          "relative z-10 flex-1 h-full text-sm font-bold transition-colors duration-300",
          role === "student" ? "text-[#065f46]" : "text-slate-400 hover:text-slate-600"
        )}
      >
        Estudiante
      </button>

      {/* Botón Empleador */}
      <button 
        type="button"
        onClick={() => onChange("employer")}
        className={cn(
          "relative z-10 flex-1 h-full text-sm font-bold transition-colors duration-300",
          role === "employer" ? "text-[#065f46]" : "text-slate-400 hover:text-slate-600"
        )}
      >
        Empleador
      </button>
    </div>
  );
}
