import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Briefcase, Globe, User, School } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Checkbox, RoleSelector, Alert, cn } from "@chambitas/ui";

const UNIVERSITIES = [
  { id: "uni-upc", name: "UPC - Univ. Peruana de Ciencias Aplicadas" },
  { id: "uni-pucp", name: "PUCP - Pontificia Univ. Católica del Perú" },
  { id: "uni-unmsm", name: "UNMSM - Univ. Nacional Mayor de San Marcos" },
  { id: "uni-ulima", name: "Univ. de Lima" },
];

const registerSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  universityId: z.string().min(1, "Debes seleccionar tu universidad"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  terms: z.boolean().refine(val => val === true, "Debes aceptar los términos y condiciones"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") || "student");
  const [showPassword, setShowPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
      universityId: "",
    }
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const onSubmit = async (data: RegisterFormValues) => {
    setRegError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Submit:", { ...data, role });
  };

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      
      {/* Panel Izquierdo */}
      <div className="hidden lg:flex lg:w-[40%] relative items-center justify-center p-12" style={{ backgroundColor: '#065f46' }}>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200" 
            alt="Workspace" 
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-[#065f46]/80" />
        </div>
        
        <div className="relative z-10 w-full max-sm space-y-12 text-white">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <Briefcase className="h-7 w-7" />
              </div>
              <h2 className="text-5xl font-black tracking-tighter">Chambitas</h2>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold leading-tight">Empieza tu camino profesional hoy</p>
              <p className="text-white/60 leading-relaxed text-sm">Únete a la plataforma líder en micro-empleos universitarios.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full max-w-[400px] space-y-8">
          
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Crea tu cuenta</h1>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Completa tus datos para empezar</p>
          </div>

          <Alert message={regError || ""} />

          {/* Selector de Rol Animado */}
          <RoleSelector role={role} onChange={setRole} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold ml-1 text-slate-700">Nombre completo</label>
              <Input 
                placeholder="Tu nombre y apellidos" 
                icon={<User className="h-4 w-4" />}
                error={errors.fullName?.message}
                {...register("fullName")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold ml-1 text-slate-700">Universidad / Institución</label>
              <div className="relative flex items-center">
                <School className={cn(
                  "absolute left-3 h-4 w-4 z-10 transition-colors",
                  errors.universityId ? "text-red-500" : "text-slate-400"
                )} />
                <select 
                  {...register("universityId")}
                  className={cn(
                    "flex h-12 w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all appearance-none font-medium",
                    errors.universityId ? "border-red-500 text-red-500" : "border-slate-200 text-[#0f172a]"
                  )}
                >
                  <option value="" className="text-slate-400">Selecciona tu universidad</option>
                  {UNIVERSITIES.map(u => (
                    <option key={u.id} value={u.id} className="text-[#0f172a]">{u.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-400">
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
              {errors.universityId && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.universityId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold ml-1 text-slate-700">Correo electrónico</label>
              <Input 
                type="email" 
                placeholder="nombre@universidad.edu" 
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold ml-1 text-slate-700">Contraseña</label>
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••" 
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 p-1">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <Checkbox label="Acepto los términos y condiciones" {...register("terms")} />
            {errors.terms && <p className="text-[11px] font-bold text-red-500 ml-1 mt-[-12px]">{errors.terms.message}</p>}

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-bold shadow-xl shadow-emerald-900/10 active:scale-[0.98] transition-all rounded-xl" 
              style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
            >
              {isSubmitting ? "Creando..." : "Crear cuenta"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="pt-4 space-y-8 text-center border-t border-slate-100">
            <p className="text-sm font-bold text-slate-500">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-extrabold hover:underline" style={{ color: '#065f46' }}>
                Iniciar sesión
              </Link>
            </p>
            <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-black text-slate-300">
              <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" />SSL SEGURO</div>
              <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" />PRIVACIDAD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
