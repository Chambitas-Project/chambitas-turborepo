import { useState } from 'react'
import { Button } from '@chambitas/ui/button'
import {
  Briefcase,
  MapPin,
  Star,
  ArrowRight,
  Loader2,
  Search,
  Zap,
} from 'lucide-react'
import './index.css'

/* ─── Demo de variantes del sistema de diseño ─────────────── */
function App() {
  const [loading, setLoading] = useState(false)

  function handleLoadingDemo() {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground] font-sans">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="border-b border-[--color-border] px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-[oklch(0.13_0.010_165/0.8)] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[--color-primary] flex items-center justify-center">
            <Briefcase className="size-4 text-[--color-primary-foreground]" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-primary-400">Chambi</span>tas
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Iniciar sesión</Button>
          <Button size="sm">Registrarse</Button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
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

      {/* ── SISTEMA DE DISEÑO — SHOWCASE ────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto space-y-12">

        {/* Variantes de botón */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[--color-muted-foreground]">
            Variantes de Botón
          </h2>
          <div className="flex flex-wrap gap-3 p-6 rounded-xl bg-[--color-card] border border-[--color-border]">
            <Button variant="default">Default</Button>
            <Button variant="glow">
              <Star className="size-4" />
              Glow
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Tamaños */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[--color-muted-foreground]">
            Escala de Tamaños
          </h2>
          <div className="flex flex-wrap items-center gap-3 p-6 rounded-xl bg-[--color-card] border border-[--color-border]">
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button size="md">md (default)</Button>
            <Button size="lg">lg</Button>
            <Button size="xl">xl</Button>
            <Button size="icon" variant="outline" aria-label="Búsqueda">
              <Search />
            </Button>
          </div>
        </div>

        {/* Estado loading */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[--color-muted-foreground]">
            Estado de Carga
          </h2>
          <div className="flex flex-wrap gap-3 p-6 rounded-xl bg-[--color-card] border border-[--color-border]">
            <Button loading={loading} onClick={handleLoadingDemo}>
              {loading ? null : (
                <>
                  <Loader2 className="size-4" />
                  Simular carga (2s)
                </>
              )}
            </Button>
            <Button variant="outline" loading>
              Procesando…
            </Button>
          </div>
        </div>

        {/* Paleta de colores */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[--color-muted-foreground]">
            Paleta OKLCH — Primary Verde Institucional
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-11 gap-1.5">
            {([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const).map((step) => {
              const lightness: Record<number, string> = {
                50: '0.96', 100: '0.92', 200: '0.84', 300: '0.73', 400: '0.63',
                500: '0.52', 600: '0.44', 700: '0.37', 800: '0.30', 900: '0.22', 950: '0.16',
              }
              const chroma: Record<number, string> = {
                50: '0.030', 100: '0.050', 200: '0.070', 300: '0.100', 400: '0.120',
                500: '0.140', 600: '0.160', 700: '0.170', 800: '0.160', 900: '0.140', 950: '0.100',
              }
              const l = lightness[step]
              const c = chroma[step]
              return (
                <div key={step} className="space-y-1 text-center">
                  <div
                    className="h-10 rounded-md border border-black/10"
                    style={{ background: `oklch(${l} ${c} 163)` }}
                  />
                  <span className="text-[10px] text-[--color-muted-foreground]">{step}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Slate tinted */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[--color-muted-foreground]">
            Chambitas Slate — Grises Tintados (hue 165)
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-11 gap-1.5">
            {([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const).map((step) => {
              const lightness: Record<number, string> = {
                50: '0.97', 100: '0.93', 200: '0.87', 300: '0.77', 400: '0.63',
                500: '0.50', 600: '0.40', 700: '0.31', 800: '0.23', 900: '0.17', 950: '0.13',
              }
              const chroma: Record<number, string> = {
                50: '0.006', 100: '0.008', 200: '0.010', 300: '0.012', 400: '0.014',
                500: '0.015', 600: '0.016', 700: '0.016', 800: '0.015', 900: '0.012', 950: '0.010',
              }
              const l = lightness[step]
              const c = chroma[step]
              return (
                <div key={step} className="space-y-1 text-center">
                  <div
                    className="h-10 rounded-md border border-black/10"
                    style={{ background: `oklch(${l} ${c} 165)` }}
                  />
                  <span className="text-[10px] text-[--color-muted-foreground]">{step}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cards glassmorphism */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[--color-muted-foreground]">
            Cards — Servicios populares
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🔧', title: 'Plomería', reviews: '4.9', price: '$250', tag: 'Popular' },
              { icon: '🧹', title: 'Limpieza del hogar', reviews: '4.8', price: '$180', tag: 'Nuevo' },
              { icon: '💻', title: 'Soporte IT', reviews: '5.0', price: '$400', tag: 'Premium' },
            ].map((svc) => (
              <div
                key={svc.title}
                className="group relative p-5 rounded-xl border border-[--color-border] bg-[--color-card] hover:border-[oklch(0.52_0.140_163/0.5)] transition-all duration-200 cursor-pointer hover:shadow-[0_0_20px_oklch(0.52_0.140_163/0.15)]"
              >
                <div className="text-3xl mb-3">{svc.icon}</div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{svc.title}</h3>
                    <div className="flex items-center gap-1 mt-1 text-sm text-[--color-muted-foreground]">
                      <Star className="size-3.5 fill-[oklch(0.80_0.150_75)] text-[oklch(0.80_0.150_75)]" />
                      <span>{svc.reviews}</span>
                      <span className="mx-1">·</span>
                      <MapPin className="size-3" />
                      <span>Cercano</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.52_0.140_163/0.15)] text-primary-300 border border-[oklch(0.52_0.140_163/0.3)]">
                    {svc.tag}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-lg">{svc.price}<span className="text-sm font-normal text-[--color-muted-foreground]">/hr</span></span>
                  <Button size="sm" variant="outline" className="group-hover:variant-default opacity-0 group-hover:opacity-100 transition-opacity">
                    Contratar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-[--color-border] px-6 py-8 text-center text-sm text-[--color-muted-foreground]">
        <p>© 2025 Chambitas · Plataforma de servicios locales · Sistema de diseño v1.0</p>
        <p className="mt-1 text-xs opacity-60">
          Tailwind CSS v4 · OKLCH · Radix UI · Turborepo
        </p>
      </footer>
    </div>
  )
}

export default App
