
import { Activity, LayoutDashboard, Users, Settings } from 'lucide-react';

export default function App() {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-inter">
      {/* Sidebar - Gris oscuro / académico */}
      <aside className="w-64 bg-slate-800 text-slate-200 flex flex-col border-r border-slate-700">
        <div className="h-16 flex items-center px-6 border-b border-slate-700 font-bold text-xl text-white tracking-tight">
          <Activity className="mr-2 h-6 w-6 text-green-400" />
          Analytics
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-3 py-2 rounded-md bg-slate-700 text-white font-medium">
            <LayoutDashboard className="mr-3 h-5 w-5 text-slate-400" />
            Overview
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-700/50 text-slate-300 font-medium transition-colors">
            <Users className="mr-3 h-5 w-5 text-slate-400" />
            Users
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-slate-700/50 text-slate-300 font-medium transition-colors">
            <Settings className="mr-3 h-5 w-5 text-slate-400" />
            Settings
          </a>
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          Chambitas ML-Engine v1.0
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm">
          <h1 className="font-semibold text-lg flex items-center">
            Dashboard
          </h1>
          <div className="flex items-center space-x-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
            ML-Engine: ONLINE
          </div>
        </header>

        {/* Content Area - Fondo gris claro listo para gráficos */}
        <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Users</div>
                <div className="text-3xl font-bold">12,450</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Sessions</div>
                <div className="text-3xl font-bold">842</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Conversion Rate</div>
                <div className="text-3xl font-bold">3.2%</div>
              </div>
            </div>
            
            {/* Chart placeholder container */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-96 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Activity className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>Chart area ready for Recharts</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
