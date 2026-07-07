import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Alert, RoleSelector } from "@chambitas/ui";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role") || "student";

  const isEmployer = role === "employer";
  const emailLabel = isEmployer ? "Correo corporativo" : "Correo institucional";
  const emailPlaceholder = isEmployer ? "nombre@empresa.com" : "nombre@universidad.edu";

  const handleRoleChange = (newRole: string) => {
    setSearchParams({ role: newRole });
  };

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      await login(data);
      navigate("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "Credenciales incorrectas o problema de conexión.";
      setLoginError(message);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden" style={{ backgroundColor: '#ffffff' }}>

      {/* Panel Izquierdo (Diseño Corporativo) */}
      <div className="hidden lg:flex lg:w-[40%] relative items-center justify-center p-12" style={{ backgroundColor: '#065f46' }}>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200"
            alt="Workspace"
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-[#065f46]/80" />
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
            <p className="text-4xl font-bold leading-tight italic">Micro-empleos que impulsan tu futuro.</p>
            <p className="text-white/80 leading-relaxed text-lg">Gestiona tus aplicaciones y encuentra las mejores oportunidades universitarias.</p>
          </div>
        </div>
      </div>

      {/* Panel Derecho (Login Form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20 relative" style={{ backgroundColor: '#ffffff' }}>

        {/* Mobile Back Button */}
        <Link to="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors">
          &larr; Volver al inicio
        </Link>

        <div className="w-full max-w-100 space-y-8 mt-8 lg:mt-0">

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Bienvenido de nuevo</h1>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Ingresa tus credenciales para continuar</p>
          </div>

          <Alert message={loginError || ""} />

          <RoleSelector role={role} onChange={handleRoleChange} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold ml-1 text-slate-700">{emailLabel}</label>
              <Input
                type="email"
                placeholder={emailPlaceholder}
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

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-xs font-bold hover:underline" style={{ color: '#065f46' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg font-bold shadow-md shadow-emerald-900/10 active:scale-[0.98] transition-all rounded-md"
              style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
            >
              {isSubmitting ? "Accediendo..." : "Iniciar sesión"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="pt-4 space-y-8 text-center border-t border-slate-100">
            <p className="text-sm font-bold text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="font-extrabold hover:underline" style={{ color: '#065f46' }}>
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
