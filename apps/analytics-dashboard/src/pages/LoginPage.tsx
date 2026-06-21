import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-inter px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-800/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Analytics Admin</h1>
          <p className="text-slate-400 mt-2 font-medium">Solo personal autorizado</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl h-14 pl-12 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="admin@chambitas.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl h-14 pl-12 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Ingresar al Dashboard'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-slate-500 text-sm font-medium">
          Chambitas Telemetry & Audit System
        </div>
      </div>
    </div>
  );
}
