import { GraduationCap, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, RoleCard } from "@chambitas/ui";
import piononoImg from "../assets/pionono.webp";

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
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <img
              src="/logo-chambitas.webp"
              alt="Chambitas"
              className="w-16 h-16 object-contain transition-transform group-hover:scale-110"
            />
            <span className="text-xl font-bold text-primary">Chambitas</span>
          </div>
        </div>
      </header>

      {/* Main Content - Flexible y centrado */}
      <main className="flex-1 flex items-center py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Column: Hero */}
            <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-left-8 duration-700">
              <div className="space-y-6 text-center lg:text-left">
                <div className="relative inline-block w-fit mx-auto lg:mx-0">
                  <Badge variant="brand" className="py-1.5 px-4 w-fit">
                    Emparejamiento de micro-tareas con IA
                  </Badge>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                  Conecta tus habilidades con <span className="text-primary">oportunidades.</span>
                </h1>

                <p className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Chambitas utiliza procesamiento de lenguaje avanzado para conectar a estudiantes universitarios con micro-tareas precisas adaptadas a su trayectoria académica.
                </p>
              </div>

              {/* Pionono Speech Bubble */}
              <div className="flex flex-row items-start gap-3 sm:gap-6 pt-4 hover:scale-105 transition-transform duration-300">
                {/* Pionono Image */}
                <img
                  src={piononoImg}
                  alt="Pionono mascota"
                  className="w-32 sm:w-48 h-auto object-contain drop-shadow-xl z-10"
                />

                {/* Smooth Speech Bubble */}
                <div className="relative bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-900/5 max-w-70 mt-4 sm:mt-8">
                  {/* Modern Bubble Tail */}
                  <div className="absolute top-8 -left-2 -translate-y-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 transform -rotate-45 rounded-tl-sm"></div>

                  <p className="text-center text-slate-600 text-sm sm:text-[15px] font-medium leading-relaxed relative z-10">
                    ¡Hola, soy <span className="font-bold text-emerald-600">Pionono</span>!<br />
                    Te ayudaré a encontrar las mejores chambitas.
                  </p>
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
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
