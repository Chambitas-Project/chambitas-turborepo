import React from "react";
import { Card, CardHeader, CardTitle, CardContent, cn } from "@chambitas/ui";
import { Briefcase } from "lucide-react";

export function AvailabilityGrid() {
  return (
    <Card className="border-none shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-black">Disponibilidad Semanal</CardTitle>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-slate-100" /> Ocupado</div>
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Disponible</div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-6 gap-3">
          <div />
          {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-400 tracking-widest pb-4">{day}</div>
          ))}
          
          {[8, 10, 12, 14, 16].map(hour => (
            <React.Fragment key={hour}>
              <div className="text-[10px] font-bold text-slate-400 flex items-center justify-end pr-4 italic">{hour}:00</div>
              {[1, 2, 3, 4, 5].map(day => {
                const isBusy = (hour + day) % 3 === 0;
                return (
                  <div 
                    key={`${day}-${hour}`} 
                    className={cn(
                      "h-12 rounded-xl border transition-all flex items-center justify-center",
                      isBusy 
                        ? "bg-slate-50 border-slate-100 opacity-40" 
                        : "bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-100/50 cursor-pointer"
                    )}
                  >
                    {!isBusy && <Briefcase className="h-3 w-3 text-emerald-600/40" />}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
