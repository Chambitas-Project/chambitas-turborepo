import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full max-w-100">
          <RegisterForm role={role} setRole={setRole} onSuccess={completeStep} />
        </div>
      </div>
    </div>
  );
}
