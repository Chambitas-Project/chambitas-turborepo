import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Input } from "@chambitas/ui";
import { apiClient } from "../api/api-client";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Parse token from URL hash on mount
  useEffect(() => {
    // Supabase Auth adds the session data to the URL hash (e.g. #access_token=123&...)
    const hash = location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // remove '#'
      const token = params.get("access_token");
      if (token) {
        setAccessToken(token);
      } else {
        setError("El enlace de recuperación es inválido o está incompleto.");
      }
    } else {
      setError("No se detectó el token de seguridad en la URL.");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Por favor, ingresa una nueva contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!accessToken) {
      setError("No hay token de acceso disponible. Solicita un nuevo enlace.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await apiClient.post("/auth/reset-password", {
        password,
        access_token: accessToken
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al restablecer la contraseña. El enlace podría haber expirado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">¡Contraseña actualizada!</h2>
            <p className="text-slate-500 font-medium">
              Tu contraseña se ha cambiado exitosamente. Ya puedes acceder a tu cuenta.
            </p>
          </div>
          <Button
            onClick={() => navigate("/login")}
            className="w-full h-12 text-lg font-bold bg-[#065f46] hover:bg-[#064e3b] text-white"
          >
            Ir a Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8">

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nueva Contraseña</h1>
          <p className="text-slate-500 font-medium">
            Ingresa tu nueva contraseña para proteger tu cuenta.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md flex flex-col gap-1 border border-red-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase">Problema de seguridad</p>
            </div>
            <p className="text-xs font-medium leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold ml-1 text-slate-700">Contraseña nueva</label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!accessToken}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 p-1">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !accessToken}
            className="w-full h-12 text-lg font-bold shadow-sm active:scale-[0.98] transition-all rounded-md bg-[#065f46] hover:bg-[#064e3b] text-white disabled:bg-slate-300"
          >
            {isSubmitting ? "Guardando..." : "Guardar contraseña"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </form>

        {!accessToken && (
          <div className="pt-4 text-center border-t border-slate-100">
            <Link to="/forgot-password" className="text-sm font-bold text-[#065f46] hover:underline">
              Volver a solicitar recuperación
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
