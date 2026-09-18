import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { apiClient } from '../api/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

  const handleSimulateTraffic = async () => {
    try {
      setIsLoading(true);
      await apiClient.runLatencyTest();
      const refreshed = await apiClient.getInfrastructureKPIs();
      setData(refreshed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#e5e9e2] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#181d19]">Observabilidad de Infraestructura</h2>
          <p className="text-xs text-[#414941]">Métricas en tiempo real desde Supabase (`infrastructure_performance_metrics`)</p>
        </div>
        <button
          onClick={handleSimulateTraffic}
          className="px-4 py-2 bg-[#0f6c41] text-white font-semibold text-xs rounded-lg hover:bg-[#0c5734] transition-colors"
        >
          ⚡ Simular Tráfico Multiservicio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
          <p>Ocurrió un error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-[#e5e9e2] shadow-sm p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#181d19]">Latencia por Microservicio (ms)</h3>
              <p className="text-xs text-slate-500">Monitoreo de tiempos de respuesta del API Gateway y consultas a la base de datos PostgreSQL</p>
            </div>
          </div>

          {/* Leyenda Explicativa de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f8faf7] p-3.5 rounded-xl border border-[#0f6c41]/10 text-xs">
            <div className="flex items-start space-x-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#0f6c41] shrink-0 mt-0.5"></span>
              <div>
                <span className="font-bold text-[#181d19]">Endpoint (ms) [Verde Oscuro]:</span>
                <p className="text-slate-600">Tiempo total de procesamiento de la petición HTTP/gRPC (Latencia de red + lógica del servidor).</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#4ade80] shrink-0 mt-0.5"></span>
              <div>
                <span className="font-bold text-[#181d19]">DB Query (ms) [Verde Claro]:</span>
                <p className="text-slate-600">Tiempo gastado exclusivamente ejecutando consultas SQL en Supabase/PostgreSQL.</p>
              </div>
            </div>
          </div>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.performanceMetrics || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9e2" />
                  <XAxis dataKey="service" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(15, 108, 65, 0.08)' }} 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e9e2', borderRadius: '8px', color: '#181d19', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ color: '#181d19', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#181d19', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ color: '#414941' }} />
                  <Bar dataKey="endpoint_latency" name="Endpoint (ms)" fill="#0f6c41" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="db_query_time_ms" name="DB Query (ms)" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* UX Funnel */}
        <div className="bg-white rounded-xl border border-[#e5e9e2] shadow-sm p-6">
          <h3 className="text-base font-semibold mb-6 text-[#414941]">Tasas de Abandono (UX Funnel)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.uxFunnel || []} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e9e2" />
                  <XAxis type="number" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="step" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(15, 108, 65, 0.08)' }} 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e9e2', borderRadius: '8px', color: '#181d19', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ color: '#181d19', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#181d19', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="abandonment_rate" name="Abandono (%)" fill="#0f6c41" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Security Alerts List */}
        <div className="bg-white rounded-xl border border-[#e5e9e2] shadow-sm p-6">
          <h3 className="text-base font-semibold mb-6 text-[#414941]">Auditoría y Seguridad</h3>
          <div className="overflow-auto h-80 space-y-4">
            {isLoading ? (
              <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
            ) : (
              data?.securityAlerts?.map((alert: any) => (
                <div key={alert.id} className="flex items-start p-4 rounded-xl bg-[#f7fbf3] border border-[#e5e9e2]">
                  <div className="mr-4 mt-1">
                    {alert.severity === 'HIGH' ? <ShieldAlert className="w-5 h-5 text-red-600" /> : 
                     alert.severity === 'MEDIUM' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : 
                     <Info className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#181d19]">{alert.message}</h4>
                    <p className="text-xs text-[#414941] mt-1">
                      {alert.service} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {data?.securityAlerts?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-[#414941]">
                <ShieldCheck className="w-12 h-12 text-[#0f6c41] mb-2 opacity-50" />
                <p>No hay alertas de seguridad recientes</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
