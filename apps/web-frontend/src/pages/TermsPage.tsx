import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Button } from "@chambitas/ui";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#065f46] flex items-center justify-center">
            <Briefcase className="size-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-emerald-700">Chambi</span>tas
          </span>
        </Link>
        <Button variant="ghost" className="text-sm font-bold text-slate-500 hover:text-slate-900" asChild>
          <Link to="/register"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Link>
        </Button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Términos y Condiciones
          </h1>
          <p className="text-lg font-medium text-slate-500">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-slate prose-lg max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">1. Aceptación de los Términos</h2>
            <p className="text-slate-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">2. Uso de la Plataforma</h2>
            <p className="text-slate-600 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">3. Privacidad y Datos</h2>
            <p className="text-slate-600 leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-slate-100 flex justify-center">
          <Button onClick={() => window.close()} className="bg-[#065f46] hover:bg-[#064e3b] text-white font-bold h-12 px-8 rounded-md cursor-pointer shadow-none">
            Entendido
          </Button>
        </div>
      </main>
    </div>
  );
}
