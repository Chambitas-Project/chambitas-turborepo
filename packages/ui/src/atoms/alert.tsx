import { AlertCircle } from "lucide-react"
import { cn } from "../utils"

interface AlertProps {
  message: string;
  className?: string;
}

export function Alert({ message, className }: AlertProps) {
  if (!message) return null;
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 animate-in fade-in zoom-in-95 duration-200",
      className
    )}>
      <AlertCircle className="h-5 w-5 shrink-0" />
      <p className="text-sm font-bold leading-tight">{message}</p>
    </div>
  );
}
