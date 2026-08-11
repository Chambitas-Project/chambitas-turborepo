import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
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

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
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

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden" style={{ backgroundColor: '#ffffff' }}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[40%] relative items-center justify-center p-12" style={{ backgroundColor: '#065f46' }}>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200"
            alt="Workspace"
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-[#065f46]/80" />
        </div>

        <Link
          to="/"
          className="absolute top-8 left-8 z-20 flex items-center gap-3 group hover:opacity-90 transition-opacity"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
            <img src="/logo-chambitas.webp" alt="Chambitas" className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Chambitas</h2>
        </Link>

        <div className="relative z-10 w-full max-w-sm space-y-12 text-white">
          <div className="space-y-4 mt-8">
            <p className="text-4xl font-bold leading-tight italic">Una nueva clave para un nuevo comienzo.</p>
            <p className="text-white/80 leading-relaxed text-lg">Crea una contraseña segura y vuelve a acceder a todas tus oportunidades.</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20 relative" style={{ backgroundColor: '#ffffff' }}>

        <div className="w-full max-w-104 space-y-8 mt-8 lg:mt-0">

          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
                <CheckCircle2 className="h-8 w-8" style={{ color: '#065f46' }} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>¡Contraseña actualizada!</h1>
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                  Tu contraseña se ha cambiado exitosamente. Ya puedes acceder a tu cuenta.
                </p>
              </div>
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-12 text-lg font-bold shadow-md shadow-emerald-900/10 active:scale-[0.98] transition-all rounded-md"
                style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
              >
                Ir a iniciar sesión
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#d1fae5' }}>
                  <KeyRound className="h-6 w-6" style={{ color: '#065f46' }} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Nueva contraseña</h1>
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                  Ingresa tu nueva contraseña para proteger tu cuenta.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl border flex flex-col gap-1.5" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#dc2626' }}>Error de seguridad</p>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                  <p className="text-xs text-slate-400 ml-1 mt-1.5">Debe tener al menos 6 caracteres.</p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !accessToken}
                  className="w-full h-12 text-lg font-bold shadow-md shadow-emerald-900/10 active:scale-[0.98] transition-all rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
                >
                  {isSubmitting ? "Guardando..." : "Confirmar contraseña"}
                  {!isSubmitting && <ArrowRight className="h-5 w-5 ml-2" />}
                </Button>
              </form>

              {!accessToken && (
                <div className="pt-4 text-center border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-500">
                    ¿El enlace expiró?{" "}
                    <Link to="/forgot-password" className="font-extrabold hover:underline" style={{ color: '#065f46' }}>
                      Solicitar uno nuevo
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
