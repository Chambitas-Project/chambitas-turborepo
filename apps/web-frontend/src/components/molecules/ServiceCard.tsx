import { Star, MapPin } from 'lucide-react'
import { Button } from '@chambitas/ui/button'

interface ServiceCardProps {
  icon: string
  title: string
  reviews: string
  price: string
  tag: string
}

export function ServiceCard({ icon, title, reviews, price, tag }: ServiceCardProps) {
  return (
    <div className="group relative p-5 rounded-xl border border-[--color-border] bg-[--color-card] hover:border-[oklch(0.52_0.140_163/0.5)] transition-all duration-200 cursor-pointer hover:shadow-[0_0_20px_oklch(0.52_0.140_163/0.15)]">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-[--color-muted-foreground]">
            <Star className="size-3.5 fill-[oklch(0.80_0.150_75)] text-[oklch(0.80_0.150_75)]" />
            <span>{reviews}</span>
            <span className="mx-1">·</span>
            <MapPin className="size-3" />
            <span>Cercano</span>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.52_0.140_163/0.15)] text-primary-300 border border-[oklch(0.52_0.140_163/0.3)]">
          {tag}
        </span>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="font-bold text-lg">
          {price}
          <span className="text-sm font-normal text-[--color-muted-foreground]">/hr</span>
        </span>
        <Button
          size="sm"
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-all"
        >
          Contratar
        </Button>
      </div>
    </div>
  )
}
