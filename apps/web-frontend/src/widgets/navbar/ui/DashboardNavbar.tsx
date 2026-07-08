import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "@chambitas/ui";
import { ProfileModal } from "../../../components/organisms/ProfileModal";
import { NotificationBell } from "../../../components/organisms/NotificationBell";

interface DashboardNavbarProps {
  role: "student" | "employer";
}

export function DashboardNavbar({ role }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation().pathname;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="/logo-chambitas.webp"
            alt="Chambitas"
            className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
          />
          <span className="text-xl font-black text-emerald-700 tracking-tighter cursor-pointer">
            Chambitas
          </span>
        </div>

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
            {role === "employer" ? "Mis Publicaciones" : "Mis Postulaciones"}
          </button>

        </div>

        <div className="flex items-center gap-4 relative">
          {role === "employer" && (
            <Button 
              onClick={() => navigate("/employer/projects/new")} 
              className="bg-[#065f46] hover:bg-[#064e3b] text-white rounded-md shadow-none px-4 h-9 text-xs font-bold cursor-pointer"
            >
              Publicar un Empleo
            </Button>
          )}
          
          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <div 
              className="h-9 w-9 rounded-md bg-slate-200 border border-slate-200 shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1 transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
               <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 p-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1">
                <button 
                  className="w-full text-left px-3 py-2 rounded-sm text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  Perfil
                </button>
                <div className="h-px bg-slate-100 mx-2" />
                <button 
                  className="w-full text-left px-3 py-2 rounded-sm text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
