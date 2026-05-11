import { Mail, Lock, Eye, EyeOff, ArrowRight, School } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Checkbox, RoleSelector, Alert, cn } from "@chambitas/ui";
import { useRegister } from "../model/use-register";

interface RegisterFormProps {
  role: string;
  setRole: (role: string) => void;
}

export function RegisterForm({ role, setRole }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    form,
    universities,
    loadingUnis,
    regError,
    onSubmit
  } = useRegister(role);

  const { register, formState: { errors, isSubmitting } } = form;

  return (
    <div className="w-full max-w-[400px] space-y-8">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Crea tu cuenta</h1>
        <p className="text-sm font-medium text-muted-foreground">Acceso directo con tus credenciales</p>
      </div>

      <Alert message={regError || ""} />

      <RoleSelector role={role} onChange={setRole} />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold ml-1 text-slate-300">Correo electrónico</label>
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
            <label className="text-sm font-bold ml-1 text-slate-300">Universidad / Institución</label>
            <div className="relative flex items-center">
              <School className={cn(
                "absolute left-3 h-4 w-4 z-10 transition-colors",
                errors.universityId ? "text-destructive-500" : "text-slate-400"
              )} />
              <select
                {...register("universityId")}
                disabled={loadingUnis}
                className={cn(
                  "flex h-12 w-full rounded-xl border bg-input pl-10 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all appearance-none font-medium",
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
          <label className="text-sm font-bold ml-1 text-slate-300">Contraseña</label>
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
          <Checkbox label="Acepto los términos y condiciones" {...register("terms")} />
          {errors.terms && <p className="text-[11px] font-bold text-destructive-500 ml-1">{errors.terms.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-lg font-bold shadow-glow-primary active:scale-[0.98] transition-all rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground"
        >
          {isSubmitting ? "Creando..." : "Crear cuenta"}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </form>

      <div className="pt-4 space-y-8 text-center border-t border-border">
        <p className="text-sm font-bold text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary-400 font-extrabold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
