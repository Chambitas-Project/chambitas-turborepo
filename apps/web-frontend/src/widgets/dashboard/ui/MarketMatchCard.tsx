import { Card, CardContent, Button } from "@chambitas/ui";
import { TrendingUp } from "lucide-react";

import { useNavigate } from "react-router-dom";

export function MarketMatchCard() {
  const navigate = useNavigate();
  return (
    <Card className="bg-emerald-600 text-white border-none shadow-2xl shadow-emerald-600/20 rounded-3xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <TrendingUp className="h-32 w-32" />
      </div>
      <CardContent className="p-8 space-y-6 relative z-10">
        <h3 className="text-2xl font-black leading-tight">Match de Mercado</h3>
        <p className="text-emerald-50/70 text-sm leading-relaxed font-medium">
          Basado en tus habilidades y carga académica actual, estás en el <span className="text-white font-black underline">top 5%</span> de candidatos estudiantiles.
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Probabilidad de Match</span>
            <span className="text-3xl font-black">94%</span>
          </div>
          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full w-[94%] shadow-[0_0_10px_white]" />
          </div>
        </div>
        <Button onClick={() => navigate("/jobs")} className="w-full bg-[#064e3b] hover:bg-[#043d2e] text-white font-black py-6 rounded-2xl shadow-lg border-none cursor-pointer">
          Ver Empleos Sugeridos
        </Button>
      </CardContent>
    </Card>
  );
}
