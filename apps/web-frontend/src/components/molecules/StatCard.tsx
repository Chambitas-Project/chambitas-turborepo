import { Card, CardContent, Badge, cn } from "@chambitas/ui";
import { Briefcase } from "lucide-react";
import React from "react";

export interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon?: React.ReactNode;
  color: 'emerald' | 'blue' | 'amber';
}

export function StatCard({ title, value, trend, icon, color }: StatCardProps) {
  return (
    <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden relative group">
      <div className={cn(
        "absolute top-0 right-0 p-6 opacity-5 transition-transform group-hover:scale-110",
        color === 'emerald' ? 'text-emerald-600' : color === 'blue' ? 'text-blue-600' : 'text-amber-600'
      )}>
        <Briefcase className="h-32 w-32" />
      </div>
      <CardContent className="p-8 flex flex-col justify-between min-h-[160px] relative z-10">
        <div className="flex items-start justify-between">
          <h3 className="font-black text-sm text-slate-800 tracking-wide">{title}</h3>
          <Badge className={cn(
            "text-[9px] font-black px-2 py-1 shrink-0",
            color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
            color === 'blue' ? 'bg-blue-50 text-blue-600' : 
            'bg-amber-50 text-amber-600'
          )}>
            {trend}
          </Badge>
        </div>
        <div className="mt-4">
          <p className="text-5xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
