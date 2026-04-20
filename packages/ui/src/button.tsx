import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

/* ============================================================
   Button — Componente atómico Shadcn para Chambitas
   Usa las variables CSS del sistema de diseño:
   · --color-primary (verde institucional oklch(0.52 0.14 163))
   · --color-accent  (hover: oklch(0.44 0.16 163) — +Chroma)
   · --color-destructive
   ============================================================ */

const buttonVariants = cva(
  /* Base — estilos compartidos por todas las variantes */
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-md",
    "text-sm font-semibold tracking-wide",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-background]",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none",
    /* Ícono SVG interno auto-redimensionado */
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /* ─── DEFAULT: Verde institucional ─────────────────────
           hover: primary-600 (+Chroma para no apagarse)
           active: primary-700 (+Chroma máximo)
           Foreground: primary-50 (tono muy claro del mismo matiz)
        ─────────────────────────────────────────────────────── */
        default: [
          "bg-[--color-primary] text-[--color-primary-foreground]",
          "shadow-md shadow-[oklch(0.13_0.010_165/0.4)]",
          "hover:bg-[oklch(0.44_0.16_163)]",     /* primary-600: +Chroma */
          "hover:shadow-[0_0_16px_oklch(0.52_0.140_163/0.4)]",
          "active:bg-[oklch(0.37_0.17_163)]",    /* primary-700: +Chroma */
          "active:scale-[0.98]",
        ],

        /* ─── DESTRUCTIVE: Rojo de acción peligrosa ─────────── */
        destructive: [
          "bg-[--color-destructive] text-[--color-destructive-foreground]",
          "shadow-md",
          "hover:bg-[oklch(0.46_0.230_25)]",
          "active:bg-[oklch(0.38_0.240_25)] active:scale-[0.98]",
        ],

        /* ─── OUTLINE: Borde primario, fondo transparente ───── */
        outline: [
          "border border-[--color-primary] bg-transparent",
          "text-[oklch(0.63_0.120_163)]",       /* primary-400 */
          "hover:bg-[oklch(0.52_0.140_163/0.12)]",
          "hover:text-[oklch(0.73_0.100_163)]", /* primary-300 */
          "active:bg-[oklch(0.52_0.140_163/0.20)] active:scale-[0.98]",
        ],

        /* ─── SECONDARY: Superficie elevada gris tinted ──────── */
        secondary: [
          "bg-[--color-secondary] text-[--color-secondary-foreground]",
          "hover:bg-[oklch(0.31_0.016_165)]",   /* slate-700 */
          "active:bg-[oklch(0.40_0.016_165)] active:scale-[0.98]",
        ],

        /* ─── GHOST: Sin fondo, solo hover sutil ─────────────── */
        ghost: [
          "bg-transparent text-[--color-foreground]",
          "hover:bg-[oklch(0.23_0.015_165)]",   /* slate-800 */
          "hover:text-[oklch(0.73_0.100_163)]", /* primary-300 en hover */
          "active:scale-[0.98]",
        ],

        /* ─── LINK: Solo texto con underline ─────────────────── */
        link: [
          "bg-transparent text-[oklch(0.63_0.120_163)]",
          "underline-offset-4 hover:underline",
          "hover:text-[oklch(0.73_0.100_163)]",
          "p-0 h-auto",
        ],

        /* ─── GLOW: Default + efecto de glow verde ───────────── */
        glow: [
          "bg-[--color-primary] text-[--color-primary-foreground]",
          "shadow-[0_0_20px_oklch(0.52_0.140_163/0.5),_0_0_40px_oklch(0.52_0.140_163/0.2)]",
          "hover:bg-[oklch(0.44_0.16_163)]",
          "hover:shadow-[0_0_30px_oklch(0.52_0.140_163/0.7),_0_0_60px_oklch(0.52_0.140_163/0.3)]",
          "active:bg-[oklch(0.37_0.17_163)] active:scale-[0.98]",
        ],
      },

      size: {
        xs:  "h-7  px-2.5 text-xs rounded-sm",
        sm:  "h-8  px-3   text-sm rounded-md",
        md:  "h-10 px-4   text-sm rounded-md",   /* default */
        lg:  "h-11 px-6   text-base rounded-lg",
        xl:  "h-13 px-8   text-lg rounded-xl",
        icon: "h-10 w-10  rounded-md",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/* ============================================================
   Props del componente
   ============================================================ */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Cuando es `true`, el componente se renderiza como un `Slot` de Radix,
   * permitiendo pasar un elemento hijo custom (ej: `<a>`, `<Link>`).
   */
  asChild?: boolean;
  /** Muestra un spinner y deshabilita el botón durante operaciones async */
  loading?: boolean;
}

/* ============================================================
   Componente Button
   ============================================================ */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            {/* Spinner nativo CSS — sin dependencias de animación */}
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Cargando…</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
