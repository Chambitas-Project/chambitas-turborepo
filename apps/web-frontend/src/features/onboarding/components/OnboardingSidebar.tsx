import { GraduationCap, Building2, CheckCircle2 } from "lucide-react";
import { cn } from "@chambitas/ui";

interface OnboardingSidebarProps {
  userRole?: string;
  step: number;
  onLogout: () => void;
}

export function OnboardingSidebar({ userRole, step, onLogout }: OnboardingSidebarProps) {
  const steps = userRole === "student" ? [1, 2, 3] : [1];

  return (
    <aside className="w-full lg:w-72 bg-[#065f46] lg:min-h-screen p-6 lg:p-10 flex lg:flex-col justify-between text-white border-b lg:border-none border-white/10">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
            {userRole === "student" ? <GraduationCap className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Onboarding</h2>
        </div>

        <nav className="flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0">
          {steps.map((i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 shrink-0 transition-all duration-300",
                step < i ? "opacity-30 scale-95" : "opacity-100 scale-100"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition-all",
                  step === i
                    ? "bg-white text-emerald-900 shadow-lg shadow-black/20"
                    : "bg-white/10 text-white border border-white/20"
                )}
              >
                {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
                  Paso {i}
                </span>
                <span className="text-xs font-bold">
                  {userRole === "student"
                    ? i === 1
                      ? "Identidad"
                      : i === 2
                        ? "Disponibilidad"
                        : "Skills"
                    : "Completar Perfil"}
                </span>
              </div>
            </div>
          ))}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="hidden lg:block text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors"
      >
        Cerrar Sesión
      </button>
    </aside>
  );
}
