import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm shrink-0">
      <h1 className="font-semibold text-lg flex items-center">
        Dashboard
      </h1>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium border border-green-500/20">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
          ML-Engine: ONLINE
        </div>
        
        <div className="flex items-center space-x-4 border-l border-slate-200 dark:border-slate-700 pl-6">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {user?.email}
          </span>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
