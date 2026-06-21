import { useEffect, useState } from 'react';
import { Activity, LayoutDashboard, Users, Settings, Briefcase, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from './api/api-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiClient.getOverviewKPIs();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
      <div className="flex-1 flex flex-col overflow-hidden">
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

        {/* Content Area */}
        <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                <p>Ocurrió un error al cargar las métricas. Intentando reconectar... ({error})</p>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Estudiantes Activos
                </div>
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <div className="text-3xl font-bold">{data?.activeStudents?.toLocaleString()}</div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Liquidez (Proyectos/Apps)
                </div>
                {isLoading ? (
                  <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <div className="text-3xl font-bold">{data?.totalProjects} / {data?.totalApplications}</div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Impacto Económico (S/.)
                </div>
                {isLoading ? (
                  <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    S/. {data?.totalIncomeGenerated?.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Eficiencia Búsqueda
                </div>
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <div className="text-3xl font-bold">{data?.avgTimeToHireDays?.toFixed(1)} <span className="text-lg text-slate-400 font-normal">días</span></div>
                )}
              </div>
            </div>
            
            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Funnel Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-base font-semibold mb-6 flex items-center">
                  Embudo de Conversión
                </h3>
                <div className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.funnelData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="step" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Income Progress Area Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-base font-semibold mb-6 flex items-center">
                  Crecimiento de Ingresos (S/.)
                </h3>
                <div className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.incomeProgress || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                        />
                        <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
