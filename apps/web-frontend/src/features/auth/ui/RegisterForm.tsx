import { Mail, Lock, Eye, EyeOff, ArrowRight, School } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Checkbox, RoleSelector, Alert, cn } from "@chambitas/ui";
import { useRegister } from "../model/use-register";
import { RegisterSuccessView } from "../../../components/molecules/RegisterSuccessView";
import { authApi } from "../api/auth.api";

interface RegisterFormProps {
  role: string;
  setRole: (role: string) => void;
  onSuccess?: () => void;
}

export function RegisterForm({ role, setRole, onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    form,
    universities,
    loadingUnis,
    regError,
    onSubmit,
    isSuccess
  } = useRegister(role, onSuccess);

  const { register, formState: { errors, isSubmitting } } = form;

  if (isSuccess) {
    return <RegisterSuccessView role={role} />;
  }

  return (
    <div className="w-full max-w-100 space-y-8">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Crea tu cuenta</h1>
        <p className="text-sm font-medium text-slate-500">Acceso directo con tus credenciales</p>
      </div>

      <Alert message={regError || ""} />

      <RoleSelector role={role} onChange={setRole} />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold ml-1 text-slate-700">Correo electrónico</label>
          <Input
            type="email"
            placeholder={role === 'employer' ? "correo@empresa.com" : "nombre@universidad.edu"}
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
                errors.universityId ? "text-destructive-500" : "text-slate-400"
              )} />
              <select
                {...register("universityId")}
                disabled={loadingUnis}
                className={cn(
                  "flex h-12 w-full rounded-md border bg-input pl-10 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all appearance-none font-medium",
                  errors.universityId ? "border-destructive-500 text-destructive-500" : "border-border text-foreground",
                  loadingUnis && "opacity-50 cursor-not-allowed"
                )}
              >
                <option value="" className="text-muted-foreground">
                  {loadingUnis ? "Cargando universidades..." : "Selecciona tu universidad"}
                </option>
                {universities.map(u => (
                  <option key={u.id} value={u.id} className="text-foreground">{u.name}</option>
                ))}
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400">
                <ArrowRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
            {errors.universityId && <p className="text-[11px] font-bold text-destructive-500 ml-1">{errors.universityId.message}</p>}
            <p className="text-[10px] text-slate-500 ml-1">Se detectará automáticamente según tu correo institucional.</p>
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-200 p-1">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <div className="space-y-1">
          <Checkbox label={<>Acepto los <Link to="/terms" target="_blank" className="hover:underline">términos y condiciones</Link></>} {...register("terms")} />
          {errors.terms && <p className="text-[11px] font-bold text-destructive-500 ml-1">{errors.terms.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-lg font-bold shadow-sm active:scale-[0.98] transition-all rounded-md bg-primary hover:bg-primary-600 text-primary-foreground"
        >
          {isSubmitting ? "Creando..." : "Crear cuenta"}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </form>

      <div className="pt-4 space-y-4 text-center border-t border-slate-100">
        <p className="text-sm font-bold text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-extrabold hover:underline" style={{ color: '#065f46' }}>
            Iniciar sesión
          </Link>
        </p>

        {/* Botón Microsoft — Solo para Estudiantes (Oculto temporalmente para piloto) */}
        {false && role === 'student' && (
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-slate-100" />
              <span className="px-3 text-xs font-medium text-slate-400 bg-white">o regístrate con</span>
              <div className="flex-1 border-t border-slate-100" />
            </div>
            <button
              type="button"
              id="microsoft-oauth-register-btn"
              onClick={() => authApi.loginWithAzure()}
              className="w-full flex items-center justify-center gap-3 h-12 border border-slate-200 rounded-md bg-white hover:bg-slate-50 active:scale-[0.98] transition-all font-semibold text-sm text-slate-700 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Continuar con Microsoft
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Solo para estudiantes con correo institucional universitario
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
