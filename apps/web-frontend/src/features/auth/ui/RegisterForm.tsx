import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Checkbox, RoleSelector, Alert } from "@chambitas/ui";
import { useRegister } from "../model/use-register";
import { RegisterSuccessView } from "../../../components/molecules/RegisterSuccessView";

interface RegisterFormProps {
  role: string;
  setRole: (role: string) => void;
  onSuccess?: () => void;
}

export function RegisterForm({ role, setRole, onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    form,
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
            placeholder={role === 'employer' ? "correo@empresa.com" : "codigoalumno@upc.edu.pe"}
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        {role === "student" && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-bold ml-1 text-slate-700">Universidad</label>
            <div className="flex items-center gap-3 h-12 w-full rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-xs">
              <img src="/upc-logo.webp" alt="Logo UPC" className="h-6 w-6 object-contain rounded-xs" />
              <span className="truncate">Universidad Peruana de Ciencias Aplicadas</span>
            </div>
            {errors.universityId && <p className="text-[11px] font-bold text-destructive-500 ml-1">{errors.universityId.message}</p>}
            <p className="text-[10px] text-slate-500 ml-1">Válido únicamente para estudiantes con correo institucional @upc.edu.pe</p>
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

      <div className="pt-4 space-y-8 text-center border-t border-slate-100">
        <p className="text-sm font-bold text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-extrabold hover:underline" style={{ color: '#065f46' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
