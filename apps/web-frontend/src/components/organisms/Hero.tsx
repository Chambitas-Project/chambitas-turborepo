import { Zap, Search, ArrowRight } from 'lucide-react'
import { Button } from '@chambitas/ui/button'

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
      {/* Fondo decorativo radial */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, oklch(0.52 0.140 163 / 0.12), transparent)',
        }}
      />

      <div className="relative max-w-3xl mx-auto space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.52_0.140_163/0.4)] bg-[oklch(0.52_0.140_163/0.1)] text-sm text-primary-300">
          <Zap className="size-3.5" />
          <span>Plataforma de servicios locales</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
          Encuentra la{' '}
          <span
            style={{
              background:
                'linear-gradient(135deg, oklch(0.63 0.120 163), oklch(0.68 0.150 290))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            chamba perfecta
          </span>{' '}
          hoy
        </h1>

        <p className="text-lg text-[--color-muted-foreground] max-w-xl mx-auto">
          Conectamos a personas con talento local para servicios del hogar,
          profesionales y más — rápido, seguro y confiable.
        </p>

        {/* Barra de búsqueda demo */}
        <div className="flex items-center gap-2 mt-8 p-1.5 rounded-xl border border-[--color-border] bg-[--color-card] max-w-lg mx-auto shadow-lg">
          <Search className="size-4 ml-3 text-[--color-muted-foreground] shrink-0" />
          <input
            type="text"
            placeholder="¿Qué servicio necesitas?"
            className="flex-1 bg-transparent px-2 py-1.5 text-sm placeholder:text-[--color-muted-foreground] focus:outline-none border-none"
          />
          <Button size="sm" className="shrink-0">
            Buscar
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
