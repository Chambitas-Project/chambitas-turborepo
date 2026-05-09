import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, School } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Checkbox, RoleSelector, Alert, cn } from "@chambitas/ui";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api-client";

interface University {
  id: string;
  name: string;
  email_domain: string;
}

// Esquema simplificado: Solo credenciales
const registerSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  universityId: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  terms: z.boolean().refine(val => val === true, "Debes aceptar los términos y condiciones"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register: registerWithApi, isAuthenticated } = useAuth();
  
  const [role, setRole] = useState(searchParams.get("role") || "student");
  const [showPassword, setShowPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false); // Nuevo estado
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
      universityId: "",
    }
  });

  const emailValue = watch("email");

  // Detección automática de universidad por dominio de correo
  useEffect(() => {
    if (role === "student" && emailValue && emailValue.includes("@")) {
      const domain = emailValue.split("@")[1]?.toLowerCase();
      if (domain) {
        const matchedUni = universities.find(u => u.email_domain.toLowerCase() === domain);
        if (matchedUni) {
          setValue("universityId", matchedUni.id);
        }
      }
    }
  }, [emailValue, universities, role, setValue]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await apiClient.get("/auth/universities");
        const unis = Array.isArray(response.data) ? response.data : (response.data.universities || []);
        setUniversities(unis);
      } catch (error) {
        console.error("Error al cargar universidades:", error);
      } finally {
        setLoadingUnis(false);
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (role === "student" && (!data.universityId || data.universityId === "")) {
      setError("universityId", { message: "Debes seleccionar una universidad" });
      return;
    }

    setRegError(null);
    try {
      await registerWithApi({
        email: data.email,
        password: data.password,
        role: role,
        university_id: role === "student" ? data.universityId : null
      });
      
      setIsSuccess(true); // Mostramos la vista de éxito
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al crear la cuenta. Verifica los datos.";
      setRegError(message);
    }
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
          
          {isSuccess ? (
            /* VISTA DE ÉXITO */
            <div className="space-y-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <div className="h-10 w-10 text-emerald-600">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">¡Cuenta creada!</h1>
                <p className="text-slate-500 font-medium">
                  Hemos enviado un enlace de verificación a tu correo institucional. Por favor, revísalo para activar tu cuenta.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/login")}
                className="w-full h-14 text-lg font-bold rounded-xl"
                style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
              >
                Ir a Iniciar sesión
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          ) : (
            /* FORMULARIO DE REGISTRO */
            <>
              <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Crea tu cuenta</h1>
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>Acceso directo con tus credenciales</p>
              </div>

          <Alert message={regError || ""} />

          <RoleSelector role={role} onChange={setRole} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
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

            {role === "student" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold ml-1 text-slate-700">Universidad / Institución</label>
                <div className="relative flex items-center">
                  <School className={cn(
                    "absolute left-3 h-4 w-4 z-10 transition-colors",
                    errors.universityId ? "text-red-500" : "text-slate-400"
                  )} />
                  <select 
                    {...register("universityId")}
                    disabled={loadingUnis}
                    className={cn(
                      "flex h-12 w-full rounded-xl border bg-white pl-10 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all appearance-none font-medium",
                      errors.universityId ? "border-red-500 text-red-500" : "border-slate-200 text-[#0f172a]",
                      loadingUnis && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <option value="" style={{ color: '#94a3b8' }}>
                      {loadingUnis ? "Cargando universidades..." : "Selecciona tu universidad"}
                    </option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id} style={{ color: '#0f172a' }}>{u.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 pointer-events-none text-slate-400">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>
                </div>
                {errors.universityId && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.universityId.message}</p>}
                <p className="text-[10px] text-slate-400 ml-1">Se detectará automáticamente según tu correo institucional.</p>
              </div>
            )}

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
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
