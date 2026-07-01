import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button, Input, Alert } from "@chambitas/ui";
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8">
        
        <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Link>

        {isSuccess ? (
          <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Revisa tu correo</h2>
              <p className="text-slate-500 font-medium">
                Hemos enviado un enlace de recuperación a <span className="text-slate-900 font-bold">{email}</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recuperar Contraseña</h1>
              <p className="text-slate-500 font-medium">
                Ingresa el correo electrónico asociado a tu cuenta y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <Alert message={error || ""} />

            <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full h-12 text-lg font-bold shadow-sm active:scale-[0.98] transition-all rounded-md bg-[#065f46] hover:bg-[#064e3b] text-white" 
              >
                {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
