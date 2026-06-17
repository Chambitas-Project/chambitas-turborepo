import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { cn } from "../utils";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick?: () => void;
  className?: string;
}

export function RoleCard({
  title,
  description,
  icon,
  buttonText,
  onClick,
  className,
}: RoleCardProps) {
  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 border-border/50 cursor-pointer active:scale-[0.99] shadow-none", 
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-6">
        {/* Icono Principal - Contenedor h-12 */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
          {icon}
        </div>
        
        {/* Contenedor de la flecha - También h-12 para simetría perfecta */}
        <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
          {/* Círculo de fondo animado - h-10 para que respire dentro del h-12 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary/10 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" />
          
          {/* Flecha: Siempre visible y centrada en el eje de h-12 */}
          <ArrowRight className="relative z-10 h-5 w-5 text-slate-300 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5" />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <CardTitle className="text-xl font-bold mb-2 tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed mb-6 text-slate-500">
          {description}
        </CardDescription>
        <Button 
          variant="secondary" 
          className="w-full font-bold bg-slate-50 text-slate-800 border border-slate-100 hover:bg-slate-100 pointer-events-none transition-all py-6 rounded-xl"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
