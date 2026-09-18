import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartsProps {
  data: any;
  isLoading: boolean;
}

export default function Charts({ data, isLoading }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Funnel Chart */}
      <div className="bg-white rounded-xl border border-[#e5e9e2] p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#181d19]">Embudo de Conversión</h3>
              <p className="text-xs text-slate-500">Transición de ofertas desde su publicación hasta su contratación efectiva</p>
            </div>
          </div>

          <div className="bg-[#f8faf7] p-2.5 rounded-lg border border-[#0f6c41]/10 text-xs text-slate-600 mb-4">
            <span className="font-bold text-[#181d19]">💡 Leyenda del Embudo:</span> Muestra la tasa de conversión paso a paso: <strong>Proyectos creados</strong> ➔ <strong>Postulaciones enviadas</strong> ➔ <strong>Contrataciones concretadas</strong>.
          </div>
        </div>

        <div className="h-80">
          {isLoading ? (
            <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.funnelData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9e2" />
                <XAxis dataKey="step" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(15, 108, 65, 0.08)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e9e2', borderRadius: '8px', color: '#181d19', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  itemStyle={{ color: '#181d19', fontSize: '13px', fontWeight: '500' }}
                  labelStyle={{ color: '#181d19', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#0f6c41" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Income Progress Area Chart */}
      <div className="bg-white rounded-xl border border-[#e5e9e2] p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#181d19]">Crecimiento de Ingresos (S/.)</h3>
              <p className="text-xs text-slate-500">Monto acumulado pagado a estudiantes según el mes de contratación</p>
            </div>
          </div>

          <div className="bg-[#f8faf7] p-2.5 rounded-lg border border-[#0f6c41]/10 text-xs text-slate-600 mb-4">
            <span className="font-bold text-[#181d19]">📈 Leyenda de Ingresos:</span> Tendencia acumulada de dinero ganado (en soles S/.) calculado a partir de la fecha exacta (`created_at`/`updated_at`) de las contrataciones registradas.
          </div>
        </div>

        <div className="h-80">
          {isLoading ? (
            <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.incomeProgress || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a0f5bd" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a0f5bd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9e2" />
                <XAxis dataKey="month" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(15, 108, 65, 0.08)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e9e2', borderRadius: '8px', color: '#181d19', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  itemStyle={{ color: '#181d19', fontSize: '13px', fontWeight: '500' }}
                  labelStyle={{ color: '#181d19', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#0f6c41" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
