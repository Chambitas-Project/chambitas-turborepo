import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartsProps {
  data: any;
  isLoading: boolean;
}

export default function Charts({ data, isLoading }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Funnel Chart */}
      <div className="bg-white rounded-xl border border-[#e5e9e2] p-6">
        <h3 className="text-base font-semibold mb-6 flex items-center text-[#414941]">
          Embudo de Conversión
        </h3>
        <div className="h-80">
          {isLoading ? (
            <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.funnelData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9e2" />
                <XAxis dataKey="stage" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
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
      <div className="bg-white rounded-xl border border-[#e5e9e2] p-6">
        <h3 className="text-base font-semibold mb-6 flex items-center text-[#414941]">
          Crecimiento de Ingresos (S/.)
        </h3>
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
