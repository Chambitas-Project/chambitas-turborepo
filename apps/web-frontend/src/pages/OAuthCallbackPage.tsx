import { useEffect, useState } from 'react';
import { apiClient } from '../api/api-client';
import { useAuth } from '../context/AuthContext';
import { PiononoLoader } from '../components/atoms/PiononoLoader';

/**
 * Página de callback OAuth para Microsoft/Azure (patrón BFF).
 *
 * Flujo:
 * 1. El API Gateway redirige a esta página tras el login en Supabase+Azure
 * 2. Supabase pone los tokens en el FRAGMENT (#) de la URL → nunca llegan al servidor
 * 3. Esta página extrae los tokens del fragment y los envía al API Gateway (POST /auth/oauth/process)
 * 4. El Gateway valida, crea el usuario, setea la cookie HttpOnly y responde con el destino
 * 5. Esta página redirige al usuario a /onboarding o /dashboard
 *
 * IMPORTANTE: Este componente NO usa ningún SDK de Supabase.
 * El frontend es un BFF puro — solo consume APIs del API Gateway.
 */
export function OAuthCallbackPage() {
  const { refreshUser } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const processOAuth = async () => {
      // Extraer tokens del fragment de la URL: #access_token=...&refresh_token=...
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace(/^#/, ''));

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token') ?? undefined;
      const errorCode = params.get('error');
      const errorDescription = params.get('error_description');

      // Manejar errores enviados por Supabase/Microsoft en el fragment
      if (errorCode) {
        const msg = errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Error en el inicio de sesión con Microsoft';
        setErrorMsg(msg);
        setTimeout(() => {
          window.location.href = `/login?error=${encodeURIComponent(msg)}&role=student`;
        }, 2500);
        return;
      }

      if (!access_token) {
        setErrorMsg('No se recibió un token válido de Microsoft. Intenta de nuevo.');
        setTimeout(() => {
          window.location.href = '/login?error=no_token&role=student';
        }, 2500);
        return;
      }

      try {
        // Enviar tokens al API Gateway (BFF) — él valida, crea usuario y setea cookie HttpOnly
        const response = await apiClient.post('/auth/oauth/process', {
          access_token,
          refresh_token,
        });

        const { isOnboarded } = response.data;

        // Refrescar el contexto de autenticación con la sesión ya establecida (cookie)
        await refreshUser();

        // Redirigir según el estado de onboarding
        window.location.href = isOnboarded ? '/dashboard' : '/onboarding';
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          'Tu correo de Microsoft no pertenece a ninguna universidad registrada en Chambitas.';
        setErrorMsg(message);
        setTimeout(() => {
          const encoded = encodeURIComponent(message);
          window.location.href = `/login?error=${encoded}&role=student`;
        }, 3000);
      }
    };

    processOAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center font-sans bg-white">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-2">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">No se pudo iniciar sesión</h2>
        <p className="text-sm text-slate-500 max-w-sm">{errorMsg}</p>
        <p className="text-xs text-slate-400">Redirigiendo al inicio de sesión...</p>
      </div>
    );
  }

  return (
    <PiononoLoader
      message="Verificando tu cuenta de Microsoft..."
      className="min-h-screen"
    />
  );
}
