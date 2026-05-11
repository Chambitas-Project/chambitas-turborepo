import { ArrowRight } from "lucide-react";
import { Button } from "@chambitas/ui";
import { useNavigate } from "react-router-dom";

export function RegisterSuccessView() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-500/10">
        <div className="h-10 w-10 text-success-500">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">¡Cuenta creada!</h1>
        <p className="text-muted-foreground font-medium">
          Hemos enviado un enlace de verificación a tu correo institucional. Por favor, revísalo para activar tu cuenta.
        </p>
      </div>
      <Button
        onClick={() => navigate("/login")}
        className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground shadow-glow-primary"
      >
        Ir a Iniciar sesión
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
}
