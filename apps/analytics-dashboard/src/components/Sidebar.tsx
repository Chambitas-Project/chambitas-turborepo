import { LayoutDashboard, Brain, Server, FlaskConical } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#f1f5ee] text-[#181d19] flex flex-col shrink-0">
      <div className="h-16 flex items-center px-8 font-bold text-xl tracking-tight">
        Chambitas
      </div>
      <div className="px-8 py-4">
        <div className="text-[10px] font-bold text-[#0f6c41] uppercase tracking-wider mb-1">
          Admin Engine
        </div>
        <div className="text-[10px] text-[#414941] font-mono">
          V2.4.0-Stable
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) => `flex items-center px-4 py-2.5 mx-2 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-[#a0f5bd] text-[#002110]' : 'hover:bg-[#ebf0e8] text-[#414941] hover:text-[#181d19]'}`}
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={`mr-3 h-4 w-4 ${isActive ? 'text-[#002110]' : 'text-[#414941]'}`} />
              Impact Dashboard
            </>
          )}
        </NavLink>
        <NavLink
          to="/ml-engine"
          className={({ isActive }) => `flex items-center px-4 py-2.5 mx-2 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-[#a0f5bd] text-[#002110]' : 'hover:bg-[#ebf0e8] text-[#414941] hover:text-[#181d19]'}`}
        >
          {({ isActive }) => (
            <>
              <Brain className={`mr-3 h-4 w-4 ${isActive ? 'text-[#002110]' : 'text-[#414941]'}`} />
              ML Engine
            </>
          )}
        </NavLink>
        <NavLink
          to="/ab-testing"
          className={({ isActive }) => `flex items-center px-4 py-2.5 mx-2 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-[#a0f5bd] text-[#002110]' : 'hover:bg-[#ebf0e8] text-[#414941] hover:text-[#181d19]'}`}
        >
          {({ isActive }) => (
            <>
              <FlaskConical className={`mr-3 h-4 w-4 ${isActive ? 'text-[#002110]' : 'text-[#414941]'}`} />
              Experimentos A/B
            </>
          )}
        </NavLink>
        <NavLink
          to="/infrastructure"
          className={({ isActive }) => `flex items-center px-4 py-2.5 mx-2 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-[#a0f5bd] text-[#002110]' : 'hover:bg-[#ebf0e8] text-[#414941] hover:text-[#181d19]'}`}
        >
          {({ isActive }) => (
            <>
              <Server className={`mr-3 h-4 w-4 ${isActive ? 'text-[#002110]' : 'text-[#414941]'}`} />
              Technical Observability
            </>
          )}
        </NavLink>
      </nav>

      <div className="p-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#0f6c41] bg-[#0f6c41]/10 px-4 py-2 rounded-xl border border-[#0f6c41]/10">
          <span className="w-2 h-2 rounded-full bg-[#0f6c41]"></span>
          <span>System Status: Healthy</span>
        </div>
      </div>
    </aside>
  );
}
