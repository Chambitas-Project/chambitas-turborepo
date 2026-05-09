import { useAuth } from "../../../context/AuthContext";
import { Button } from "@chambitas/ui";

interface DashboardNavbarProps {
  role: "student" | "employer";
}

export function DashboardNavbar({ role }: DashboardNavbarProps) {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="text-xl font-black text-emerald-700 tracking-tighter cursor-pointer" onClick={() => window.location.href="/"}>
            Chambitas
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <button className="hover:text-emerald-600 transition-colors">Buscar Empleos</button>
            <button className={role === "employer" ? "text-emerald-600 border-b-2 border-emerald-600 pb-5 mt-5" : "hover:text-emerald-600 transition-colors"}>
              {role === "employer" ? "Mis Publicaciones" : "Mis Tareas"}
            </button>
            <button className="hover:text-emerald-600 transition-colors">Mensajes</button>
            <button className={role === "student" ? "text-emerald-600 border-b-2 border-emerald-600 pb-5 mt-5" : "hover:text-emerald-600 transition-colors"}>
              Panel
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-bold text-slate-500 hover:text-slate-900">Cambiar Rol</button>
          <Button className="bg-[#065f46] hover:bg-[#064e3b] text-white rounded-lg px-4 h-9 text-xs font-bold">
            {role === "employer" ? "Publicar un Empleo" : "Publicar Empleo"}
          </Button>
          <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" />
          </div>
        </div>
      </div>
    </nav>
  );
}
