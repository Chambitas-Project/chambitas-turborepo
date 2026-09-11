import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="h-20 bg-transparent text-[#181d19] flex items-center justify-end px-8 shrink-0">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-[#0f6c41]/10 text-[#0f6c41] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#0f6c41]/10">
          <span className="w-2 h-2 rounded-full bg-[#0f6c41] animate-pulse mr-2"></span>
          ML-Engine: ONLINE
        </div>

        <div className="flex items-center space-x-4 border-l border-[#d3d8d0] pl-6">
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-sm font-semibold text-[#414941] hover:text-[#181d19] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
