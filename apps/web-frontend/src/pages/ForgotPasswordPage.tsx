import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button, Input } from "@chambitas/ui";
import { apiClient } from "../api/api-client";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error al procesar tu solicitud.");
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
            <p className="text-4xl font-bold leading-tight italic">Tu cuenta, siempre a salvo.</p>
            <p className="text-white/80 leading-relaxed text-lg">Recupera el acceso a tu cuenta de forma rápida y segura.</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20 relative" style={{ backgroundColor: '#ffffff' }}>

        <Link to="/login" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>

        <div className="w-full max-w-104 space-y-8 mt-8 lg:mt-0">

          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
                <CheckCircle2 className="h-8 w-8" style={{ color: '#065f46' }} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Revisa tu correo</h1>
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                  Hemos enviado un enlace de recuperación a <span className="font-bold" style={{ color: '#065f46' }}>{email}</span>.
                </p>
              </div>
              <div className="p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" style={{ color: '#065f46' }} />
                <p className="text-sm font-medium" style={{ color: '#064e3b' }}>
                  Si no lo encuentras, por favor revisa tu carpeta de spam.
                </p>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center w-full h-12 text-lg font-bold rounded-md transition-all active:scale-[0.98] shadow-md shadow-emerald-900/10"
                style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>Recuperar contraseña</h1>
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                  Ingresa el correo asociado a tu cuenta y te enviaremos instrucciones para restablecerla.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl border flex flex-col gap-1.5" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#dc2626' }}>Error</p>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold ml-1 text-slate-700">Correo electrónico</label>
                  <Input
                    type="email"
                    placeholder="nombre@universidad.edu"
                    icon={<Mail className="h-4 w-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-bold shadow-md shadow-emerald-900/10 active:scale-[0.98] transition-all rounded-md"
                  style={{ backgroundColor: '#064e3b', color: '#ffffff' }}
                >
                  {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </form>

              <div className="pt-4 text-center border-t border-slate-100">
                <p className="text-sm font-bold text-slate-500">
                  ¿Recordaste tu contraseña?{" "}
                  <Link to="/login" className="font-extrabold hover:underline" style={{ color: '#065f46' }}>
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
