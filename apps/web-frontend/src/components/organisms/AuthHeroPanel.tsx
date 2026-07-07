import { Briefcase } from "lucide-react";

export function AuthHeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-[40%] relative items-center justify-center p-12 bg-primary-900">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200"
          alt="Workspace"
          className="h-full w-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-primary-900/80" />
      </div>

      <div className="relative z-10 w-full max-sm space-y-12 text-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
              <Briefcase className="h-7 w-7" />
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter">Chambitas</h2>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-bold leading-tight">Empieza tu camino profesional hoy</p>
            <p className="text-slate-300 leading-relaxed text-sm">Únete a la plataforma líder en micro-empleos universitarios.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
