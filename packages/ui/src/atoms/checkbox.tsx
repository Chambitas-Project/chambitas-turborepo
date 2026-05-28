import * as React from "react"
import { cn } from "../utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className={cn(
              "peer h-5 w-5 appearance-none rounded border border-slate-300 bg-white transition-all checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20 outline-none",
              className
            )}
            ref={ref}
            {...props}
          />
          <svg
            className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {label && <span className="text-sm text-slate-600 select-none group-hover:text-slate-800 transition-colors">{label}</span>}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
