import { Link } from "react-router-dom";

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

      {/* Logo and Home Link (Desktop) */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 z-20 flex items-center gap-3 group hover:opacity-90 transition-opacity"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
          <img
            src="/logo-chambitas.webp"
            alt="Chambitas"
            className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
          />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Chambitas</h2>
      </Link>

      {/* Centered text (Desktop) */}
      <div className="relative z-10 w-full max-w-sm space-y-12 text-white">
        <div className="space-y-4 mt-8">
          <p className="text-4xl font-bold leading-tight italic">Empieza tu camino profesional hoy.</p>
          <p className="text-white/80 leading-relaxed text-lg">Únete a la plataforma líder en micro-empleos universitarios.</p>
        </div>
      </div>
    </div>
  );
}
