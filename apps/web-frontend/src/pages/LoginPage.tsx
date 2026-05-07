import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Briefcase, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Checkbox, Alert, RoleSelector } from "@chambitas/ui";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") || "student");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    }
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (data.email !== "admin@chambitas.com" || data.password !== "123456") {
      setAuthError("El correo electrónico o la contraseña son incorrectos.");
      return;
    }
    console.log("Login Success:", { ...data, role });
  };

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      
      {/* Panel Izquierdo */}
      <div className="hidden lg:flex lg:w-[40%] relative items-center justify-center p-12" style={{ backgroundColor: '#065f46' }}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
            alt="Office" 
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-[#065f46]/80" />
        </div>
        
        <div className="relative z-10 w-full max-w-sm space-y-12 text-white">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <Briefcase className="h-7 w-7" />
              </div>
              <h2 className="text-5xl font-black tracking-tighter">Chambitas</h2>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold leading-tight">Conéctate con las mejores oportunidades</p>
              <p className="text-white/60 leading-relaxed text-sm">Potenciando las conexiones profesionales entre el talento verificado y los principales empleadores.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full max-w-[400px] space-y-8">
          
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Bienvenido de nuevo</h1>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Inicia sesión con tu cuenta</p>
          </div>

          <Alert message={authError || ""} />

          {/* Selector de Rol Animado */}
          <RoleSelector role={role} onChange={setRole} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold ml-1" style={{ color: '#334155' }}>Correo electrónico</label>
              <Input 
                type="email" 
                placeholder="nombre@universidad.edu" 
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold" style={{ color: '#334155' }}>Contraseña</label>
                <button type="button" className="text-xs font-bold hover:underline" style={{ color: '#065f46' }}>¿Olvidaste?</button>
              </div>
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••" 
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <Checkbox label="Mantener mi sesión iniciada por 30 días" {...register("rememberMe")} />

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-bold shadow-xl shadow-emerald-900/10 active:scale-[0.98] transition-all rounded-xl disabled:opacity-70 disabled:cursor-not-allowed" 
              style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
            >
              {isSubmitting ? "Verificando..." : "Iniciar sesión"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>
              ¿Aún no tienes cuenta?{" "}
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#065f46' }}>
                Crea tu perfil
              </Link>
            </p>
            <div className="mt-8 flex justify-center gap-6 text-[10px] uppercase tracking-widest font-black" style={{ color: '#cbd5e1' }}>
              <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" />SSL SEGURO</div>
              <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" />PRIVACIDAD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
