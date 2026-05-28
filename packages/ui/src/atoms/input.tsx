import * as React from "react"
import { cn } from "../utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, rightElement, error, style, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <div className="relative flex items-center w-full">
          {icon && (
            <div className={cn(
              "absolute left-3 transition-colors z-10",
              error ? "text-red-500" : "text-slate-400"
            )}>
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            style={{ backgroundColor: '#ffffff', color: '#0f172a', ...style }}
            className={cn(
              "flex h-12 w-full rounded-xl border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 transition-all duration-150",
              icon && "pl-10",
              rightElement && "pr-10",
              error 
                ? "border-red-500 focus-visible:ring-red-500/20" 
                : "border-slate-200 focus-visible:ring-primary/20",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 z-10">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[11px] font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
