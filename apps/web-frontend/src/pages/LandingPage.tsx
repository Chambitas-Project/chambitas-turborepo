import { GraduationCap, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, RoleCard, IAOptimizerCard } from "@chambitas/ui";

export function LandingPage() {
  const navigate = useNavigate();

  const handleRoleSelection = (role: string) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="light min-h-screen bg-background font-sans text-foreground flex flex-col">
      {/* Header - Totalmente limpio y fijo arriba */}
      <header className="w-full bg-white sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center lg:justify-start">
          <span className="text-xl font-bold text-primary">Chambitas</span>
        </div>
      </header>

      {/* Main Content - Flexible y centrado */}
      <main className="flex-1 flex items-center py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Column: Hero */}
            <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-left-8 duration-700">
              <div className="space-y-6 text-center lg:text-left">
                <Badge variant="brand" className="py-1.5 px-4 mx-auto lg:mx-0 w-fit">
                  ⚡ Emparejamiento de micro-tareas con IA
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                  Conecta tus habilidades con <span className="text-primary">oportunidades.</span>
                </h1>

                <p className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Chambitas utiliza procesamiento de lenguaje avanzado para conectar a estudiantes universitarios con micro-tareas precisas adaptadas a su trayectoria académica.
                </p>
              </div>

              {/* Social Proof & IA Card */}
              <div className="space-y-6 flex flex-col items-center lg:items-start">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-md border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Student" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-600 text-center">
                    <span className="text-slate-900">2,500+</span> estudiantes emparejados esta semana
                  </p>
                </div>

                <div className="w-full max-w-[320px]">
                  <IAOptimizerCard className="border-primary/10" />
                </div>
              </div>
            </div>

            {/* Right Column: Role Selection */}
            <div className="flex flex-col space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-12 lg:slide-in-from-right-8 duration-700 delay-150">
              <div className="space-y-3 text-center lg:text-left pt-8 lg:pt-0">
                <h2 className="text-2xl lg:text-3xl font-bold">Elige tu camino</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto lg:mx-0">
                  Selecciona el rol que mejor se adapte a tu objetivo actual en la plataforma Chambitas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:max-w-md sm:mx-auto lg:mx-0 lg:max-w-none">
                <RoleCard
                  title="Estudiante"
                  description="Monetiza tu experiencia académica resolviendo micro-tareas alineadas con tu carrera."
                  icon={<GraduationCap className="h-5 w-5" />}
                  buttonText="Seleccionar Cuenta de Estudiante"
                  onClick={() => handleRoleSelection("student")}
                />

                <RoleCard
                  title="Empleador"
                  description="Publica micro-empleos y deja que nuestro motor de NLP encuentre el talento perfecto."
                  icon={<Building2 className="h-5 w-5" />}
                  buttonText="Seleccionar Cuenta de Empleador"
                  onClick={() => handleRoleSelection("employer")}
                />
              </div>

              <footer className="text-center lg:text-right pt-4 pb-8 lg:pb-0">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                  Protegido por encriptación empresarial
                </p>
              </footer>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
