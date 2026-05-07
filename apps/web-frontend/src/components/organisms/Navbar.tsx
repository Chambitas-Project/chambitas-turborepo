import { Button } from '@chambitas/ui/button'
import { Briefcase } from 'lucide-react'

export function Navbar() {
  return (
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
        <button className="text-sm font-medium hover:text-primary-400 transition-colors">Iniciar sesión</button>
        <Button size="sm">Registrarse</Button>
      </div>
    </nav>
  )
}
