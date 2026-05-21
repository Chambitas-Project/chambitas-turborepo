import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "@chambitas/ui";
import { ProfileModal } from "../../../components/organisms/ProfileModal";

interface DashboardNavbarProps {
  role: "student" | "employer";
}

export function DashboardNavbar({ role }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation().pathname;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="text-xl font-black text-emerald-700 tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            Chambitas
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            {role === "student" && (
              <button 
                className={location === "/jobs" ? "text-emerald-600 border-b-2 border-emerald-600 pb-5 mt-5 cursor-pointer" : "hover:text-emerald-600 transition-colors cursor-pointer"}
                onClick={() => navigate("/jobs")}
              >
                Buscar Empleos
              </button>
            )}
            
            <button 
              className={location.startsWith("/employer/projects") || location === "/student/applications" ? "text-emerald-600 border-b-2 border-emerald-600 pb-5 mt-5 cursor-pointer" : "hover:text-emerald-600 transition-colors cursor-pointer"}
              onClick={() => navigate(role === "employer" ? "/employer/projects" : "/student/applications")}
            >
              {role === "employer" ? "Mis Publicaciones" : "Mis Tareas"}
            </button>

            <button className="hover:text-emerald-600 transition-colors cursor-pointer">Mensajes</button>

            <button 
              className={location === "/dashboard" ? "text-emerald-600 border-b-2 border-emerald-600 pb-5 mt-5 cursor-pointer" : "hover:text-emerald-600 transition-colors cursor-pointer"}
              onClick={() => navigate("/dashboard")}
            >
              Panel
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          {role === "student" && (
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900 cursor-pointer">Cambiar Rol</button>
          )}
          <Button 
            onClick={() => navigate(role === "employer" ? "/employer/projects/new" : "/jobs")}
            className="bg-[#065f46] hover:bg-[#064e3b] text-white rounded-lg px-4 h-9 text-xs font-bold cursor-pointer"
          >
            {role === "employer" ? "Publicar un Empleo" : "Publicar Empleo"}
          </Button>
          
          <div className="relative">
            <div 
              className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                <button 
                  className="w-full text-left px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                >
                  Perfil
                </button>
                <div className="h-px bg-slate-100 my-1 w-full" />
                <button 
                  className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={async () => {
                    setIsDropdownOpen(false);
                    await logout();
                    navigate("/login");
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </nav>
  );
}
