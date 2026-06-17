import { cn } from "@chambitas/ui";
import { DAYS, TIME_SLOTS, type Profile } from "../types";

interface AvailabilityGridProps {
  profile: Profile | null;
}

export function AvailabilityGrid({ profile }: AvailabilityGridProps) {
  return (
    <div className="space-y-8 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-6 gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Horario de Disponibilidad</h2>
          <p className="text-xs font-bold text-slate-400">Define tus bloques libres para recibir propuestas de tareas.</p>
        </div>
        <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded bg-slate-100 border border-slate-200" /> Ocupado</div>
          <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded bg-emerald-500 shadow-sm shadow-emerald-200" /> Disponible</div>
        </div>
      </div>
      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <div className="grid grid-cols-8 gap-3 min-w-162.5">
          <div />
          {DAYS.map(day => (
            <div key={day.id} className="text-center text-[10px] font-black text-slate-900 uppercase tracking-tighter pb-4">
              {day.label}
            </div>
          ))}
          <div className="col-span-8 space-y-2 h-100 overflow-y-auto pr-4 custom-scrollbar">
            {TIME_SLOTS.map((time, idx) => (
              <div key={time} className="grid grid-cols-8 gap-3 items-center">
                <div className="text-[10px] font-black text-slate-300 text-right pr-2">{time}</div>
                {DAYS.map(day => {
                  const blocks = profile?.availability_blocks || {};
                  const isAvailable = blocks[day.id]?.[idx] === "1";
                  return (
                    <div
                      key={`${day.id}-${idx}`}
                      className={cn(
                        "h-8 rounded-md transition-all border border-slate-100",
                        isAvailable ? "bg-emerald-600 shadow-sm shadow-emerald-200" : "bg-slate-50/40"
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
