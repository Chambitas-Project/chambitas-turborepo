import { Cpu } from "lucide-react";
import { Card } from "../card";
import { cn } from "../utils";

export function IAOptimizerCard({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4 bg-white/80 backdrop-blur-md border-border/40 shadow-xl rounded-2xl", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-500/10 text-success-500">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Optimizador IA</h4>
          <p className="text-[10px] text-slate-500">Buscando coincidencias...</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-[98%] bg-primary rounded-full animate-pulse" />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-primary">98% de coincidencia</span>
          <span className="text-slate-400">Procesando NLP</span>
        </div>
      </div>
    </Card>
  );
}
