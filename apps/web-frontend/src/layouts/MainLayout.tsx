import { Navbar } from '../components/organisms/Navbar'
import { Footer } from '../components/organisms/Footer'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground] font-sans">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
