import { useState } from 'react'
import { Button } from '@chambitas/ui/button'
import { Star, Loader2 } from 'lucide-react'
import { Hero } from '../components/organisms/Hero'
import { ServiceCard } from '../components/molecules/ServiceCard'

export function LandingPage() {
  const [loading, setLoading] = useState(false)

  function handleLoadingDemo() {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const popularServices = [
    { icon: '🔧', title: 'Plomería', reviews: '4.9', price: '$250', tag: 'Popular' },
    { icon: '🧹', title: 'Limpieza del hogar', reviews: '4.8', price: '$180', tag: 'Nuevo' },
    { icon: '💻', title: 'Soporte IT', reviews: '5.0', price: '$400', tag: 'Premium' },
  ]

  return (
    <>
      <Hero />

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
          </div>
        </div>

        {/* Cards — Servicios populares */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[--color-muted-foreground]">
            Cards — Servicios populares
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {popularServices.map((svc) => (
              <ServiceCard key={svc.title} {...svc} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
