import { Card, CardContent, Badge, cn } from "@chambitas/ui";
import { Briefcase, Users, Star } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon?: React.ReactNode;
  color: 'emerald' | 'blue' | 'amber';
  onClick?: () => void;
}

export function StatCard({ title, value, trend, color, onClick }: StatCardProps) {
  const IconComponent = color === 'emerald' ? Briefcase : color === 'blue' ? Users : Star;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden relative group transition-all duration-300",
        onClick && "cursor-pointer hover:shadow-md hover:border-emerald-300 hover:-translate-y-1 active:scale-[0.99]"
      )}
    >
      <CardContent className="p-6 flex flex-col justify-between h-full min-h-40 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300",
              color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  'bg-amber-50 text-amber-600 border border-amber-100'
            )}>
              <IconComponent className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-[11px] text-slate-500 uppercase tracking-wider leading-tight">
              {title}
            </h3>
          </div>

          <Badge className={cn(
            "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-none shrink-0 whitespace-nowrap",
            color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
          )}>
            {trend}
          </Badge>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
          <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
            Ver detalle &rarr;
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
