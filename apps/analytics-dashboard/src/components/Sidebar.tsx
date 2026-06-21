import { Activity, LayoutDashboard, Brain, Server } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 text-slate-200 flex flex-col border-r border-slate-700 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-700 font-bold text-xl text-white tracking-tight">
        <Activity className="mr-2 h-6 w-6 text-green-400" />
        Analytics
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex items-center px-3 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}
        >
          <LayoutDashboard className="mr-3 h-5 w-5 text-slate-400" />
          Overview
        </NavLink>
        <NavLink 
          to="/ml-engine" 
          className={({ isActive }) => `flex items-center px-3 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}
        >
          <Brain className="mr-3 h-5 w-5 text-slate-400" />
          ML-Engine
        </NavLink>
        <NavLink 
          to="/infrastructure" 
          className={({ isActive }) => `flex items-center px-3 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}
        >
          <Server className="mr-3 h-5 w-5 text-slate-400" />
          Infraestructura
        </NavLink>
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        Chambitas ML-Engine v1.0
      </div>
    </aside>
  );
}
