import { Card, CardContent, Badge, cn } from "@chambitas/ui";
import { Briefcase, Users, Clock } from "lucide-react";

export function EmployerStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <StatCard title="TRABAJOS ACTIVOS" value="24" trend="+12% vs mes pasado" icon={<Briefcase className="h-6 w-6 text-emerald-600" />} color="emerald" />
      <StatCard title="NUEVOS POSTULANTES" value="142" trend="8 nuevos hoy" icon={<Users className="h-6 w-6 text-blue-600" />} color="blue" />
      <StatCard title="REVISIONES PENDIENTES" value="09" trend="Acción Requerida" icon={<Clock className="h-6 w-6 text-amber-600" />} color="amber" />
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: any) {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden relative group">
      <div className={cn(
        "absolute top-0 right-0 p-6 opacity-5 transition-transform group-hover:scale-110",
        color === 'emerald' ? 'text-emerald-600' : color === 'blue' ? 'text-blue-600' : 'text-amber-600'
      )}>
        <Briefcase className="h-32 w-32" />
      </div>
      <CardContent className="p-8 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn("p-3 rounded-2xl", 
            color === 'emerald' ? 'bg-emerald-50' : color === 'blue' ? 'bg-blue-50' : 'bg-amber-50'
          )}>
            {icon}
          </div>
          <Badge className={cn(
            "text-[9px] font-black px-2 py-1",
            color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
            color === 'blue' ? 'bg-blue-50 text-blue-600' : 
            'bg-amber-50 text-amber-600'
          )}>
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">{title}</p>
          <p className="text-4xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
