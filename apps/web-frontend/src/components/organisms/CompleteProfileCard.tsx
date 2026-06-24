import { useState } from "react";
import { Card, Badge } from "@chambitas/ui";
import { ChevronRight, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function CompleteProfileCard() {
  const { user } = useAuth();
  const [showMissing, setShowMissing] = useState(false);
  
  if (!user) return null;

  // Calculate dynamic completion percentage and track missing items
  let completion = 20; // Base creation
  const missingItems: string[] = [];
  const completedItems: string[] = ['Crear cuenta'];

  if (user.isOnboarded) {
    completion += 40;
    completedItems.push('Onboarding inicial');
  } else {
    missingItems.push('Onboarding inicial');
  }
  
  const userData = user as any;
  if (userData.name || userData.full_name) {
    completion += 10;
    completedItems.push('Nombre personal');
  } else {
    missingItems.push('Nombre personal');
  }

  if (userData.company_name) {
    completion += 10;
    completedItems.push('Nombre de la empresa');
  } else {
    missingItems.push('Nombre de la empresa');
  }

  if (userData.description) {
    completion += 20;
    completedItems.push('Descripción de la empresa');
  } else {
    missingItems.push('Descripción de la empresa');
  }

  // Cap at 100
  completion = Math.min(100, completion);

  // Hide the card if the profile is 100% complete
  if (completion >= 100) {
    return null;
  }

  return (
    <Card className="bg-emerald-50/50 border-emerald-100/50 border shadow-none rounded-xl p-8 relative overflow-hidden transition-all duration-300">
       <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none">
         <Badge className="h-24 w-24 rounded-full bg-emerald-500" />
       </div>
       <div className="relative z-10">
         <div className="flex justify-between items-end mb-1">
           <h4 className="text-emerald-900 font-black">Perfil de Empresa</h4>
           <span className="text-emerald-700 font-bold text-xs">{completion}%</span>
         </div>
         <p className="text-emerald-800/80 text-xs font-medium mb-4 leading-relaxed">
           Completa tu perfil para atraer un 40% más de postulantes.
         </p>
         
         <div className="space-y-4">
            <div className="h-2 w-full bg-emerald-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                style={{ width: `${completion}%` }}
              />
            </div>
            
            <button 
              onClick={() => setShowMissing(!showMissing)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-800 hover:gap-3 transition-all cursor-pointer"
            >
              VER QUÉ FALTA {showMissing ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            
            {showMissing && (
              <div className="pt-2 pb-1 space-y-2 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-wider mb-2">Por completar:</p>
                {missingItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-emerald-800/80">
                    <Circle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
                
                {completedItems.length > 0 && (
                  <>
                    <div className="h-px w-full bg-emerald-200/50 my-3" />
                    <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-wider mb-2">Completado:</p>
                    {completedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-emerald-700/50">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="line-through">{item}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
         </div>
       </div>
    </Card>
  );
}
