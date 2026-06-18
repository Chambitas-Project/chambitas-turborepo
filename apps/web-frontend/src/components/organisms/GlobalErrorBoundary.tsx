import { useRouteError } from "react-router-dom";
import { Button } from "@chambitas/ui";
import { AlertCircle } from "lucide-react";

export function GlobalErrorBoundary() {
  const error = useRouteError() as Error;

  // Si es un error de importación dinámica (chunk antiguo no encontrado),
  // forzamos una recarga dura automática de la página para obtener los nuevos chunks.
  if (
    error?.name === "TypeError" &&
    (error?.message?.includes("Failed to fetch dynamically imported module") ||
     error?.message?.includes("importing a module script failed"))
  ) {
    // Evitamos recargas infinitas si el fallo es constante por otra razón
    const hasReloaded = sessionStorage.getItem("chunk_reload_attempt");
    if (!hasReloaded) {
      sessionStorage.setItem("chunk_reload_attempt", "true");
      window.location.reload();
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-slate-500 font-medium animate-pulse">
            Actualizando a la última versión...
          </p>
        </div>
      );
    }
  }

  // Limpiamos el intento si hay otro error o carga exitosa luego
  sessionStorage.removeItem("chunk_reload_attempt");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Algo salió mal</h2>
          <p className="text-slate-500 text-sm">
            Ha ocurrido un error inesperado al intentar cargar esta página. 
            Es posible que haya una nueva versión disponible.
          </p>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4 text-left overflow-hidden">
          <p className="text-xs font-mono text-slate-600 truncate">
            {error?.message || "Error desconocido"}
          </p>
        </div>

        <Button 
          onClick={() => window.location.reload()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
        >
          Recargar página
        </Button>
      </div>
    </div>
  );
}
