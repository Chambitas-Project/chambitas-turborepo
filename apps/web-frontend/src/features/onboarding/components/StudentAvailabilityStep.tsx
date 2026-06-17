import { Info, Clock } from "lucide-react";
import { cn } from "@chambitas/ui";
import { DAYS, TIME_SLOTS } from "../types";

interface StudentAvailabilityStepProps {
  studentData: any;
  toggleAvailability: (dayId: string, index: number) => void;
  calculateTotalHours: () => number;
}

export function StudentAvailabilityStep({
  studentData,
  toggleAvailability,
  calculateTotalHours,
}: StudentAvailabilityStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
        <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
          Haz clic o arrastra para seleccionar los bloques de 30 minutos donde estés libre.
          Recomendamos al menos <strong className="font-black">10 horas</strong> a la semana.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Tu Semana
          </span>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-black text-slate-900">
              {calculateTotalHours()} hrs seleccionadas
            </span>
          </div>
        </div>
        <div className="p-4 overflow-x-auto custom-scrollbar">
          <div className="grid grid-cols-8 gap-2 min-w-[500px]">
            <div />
            {DAYS.map((day) => (
              <div
                key={day.id}
                className="text-[10px] font-black text-center text-slate-900 uppercase tracking-widest"
              >
                {day.label}
              </div>
            ))}

            <div className="col-span-8 h-[400px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
              {TIME_SLOTS.map((time, idx) => (
                <div key={time} className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-[9px] font-black text-slate-400 text-right pr-2">
                    {time}
                  </div>
                  {DAYS.map((day) => {
                    const isSelected = (studentData.availability as any)[day.id][idx] === "1";
                    return (
                      <div
                        key={`${day.id}-${idx}`}
                        onMouseDown={() => toggleAvailability(day.id, idx)}
                        className={cn(
                          "h-7 rounded cursor-pointer transition-colors border",
                          isSelected
                            ? "bg-emerald-500 border-emerald-600 shadow-sm"
                            : "bg-slate-50 border-slate-200 hover:border-emerald-300"
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
    </div>
  );
}
