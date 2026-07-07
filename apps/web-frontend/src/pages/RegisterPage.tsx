import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AuthHeroPanel } from "../components/organisms/AuthHeroPanel";
import { RegisterForm } from "../features/auth/ui/RegisterForm";
import { useUxTelemetry } from "../hooks/useUxTelemetry";

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") || "student");

  const { completeStep } = useUxTelemetry('Registration', 'FillForm');

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Panel Izquierdo (Organism) */}
      <AuthHeroPanel />

      {/* Panel Derecho (Assembler) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20 relative" style={{ backgroundColor: '#ffffff' }}>
        
        {/* Mobile Back Button */}
        <Link to="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors z-20">
          &larr; Volver al inicio
        </Link>

        <div className="w-full max-w-100 mt-8 lg:mt-0 relative z-10">
          <RegisterForm role={role} setRole={setRole} onSuccess={completeStep} />
        </div>
      </div>
    </div>
  );
}
