import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { apiClient } from '../api/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

export default function InfrastructurePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiClient.getInfrastructureKPIs();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos de Infraestructura');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center text-red-700 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
          <p>Ocurrió un error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-base font-semibold mb-6">Latencia por Microservicio (ms)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.performanceMetrics || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="service" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="endpoint_latency" name="Endpoint (ms)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="db_query_time_ms" name="DB Query (ms)" fill="#eab308" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* UX Funnel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-base font-semibold mb-6">Tasas de Abandono (UX Funnel)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.uxFunnel || []} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="step" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Bar dataKey="abandonment_rate" name="Abandono (%)" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Security Alerts List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-base font-semibold mb-6">Auditoría y Seguridad</h3>
          <div className="overflow-auto h-80 space-y-4">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
            ) : (
              data?.securityAlerts?.map((alert: any) => (
                <div key={alert.id} className="flex items-start p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="mr-4 mt-1">
                    {alert.severity === 'HIGH' ? <ShieldAlert className="w-5 h-5 text-red-500" /> : 
                     alert.severity === 'MEDIUM' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> : 
                     <Info className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{alert.message}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {alert.service} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {data?.securityAlerts?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <ShieldCheck className="w-12 h-12 text-green-500 mb-2 opacity-50" />
                <p>No hay alertas de seguridad recientes</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
