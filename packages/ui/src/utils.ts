import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilidad estándar de Shadcn para combinar clases de Tailwind.
 * Usa clsx para condicionales y tailwind-merge para resolver conflictos.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
