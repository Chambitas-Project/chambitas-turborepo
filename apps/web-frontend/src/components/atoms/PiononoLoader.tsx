import piononoImg from "../../assets/pionono.webp";

interface PiononoLoaderProps {
  message?: string;
  className?: string;
}

export function PiononoLoader({ message = "Cargando...", className = "min-h-[50vh]" }: PiononoLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative w-48 h-48">
        <img
          src={piononoImg}
          alt="Loading base"
          className="absolute inset-0 w-full h-full object-contain grayscale opacity-20"
        />
        <img
          src={piononoImg}
          alt="Loading animation"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
          style={{
            clipPath: 'inset(0 100% 0 0)',
            animation: 'piononoFill 1.5s ease-in-out infinite'
          }}
        />
      </div>
      {message && (
        <p className="text-sm text-slate-400 font-bold tracking-tight animate-pulse">
          {message}
        </p>
      )}
      <style>{`
        @keyframes piononoFill {
          0% { clip-path: inset(0 100% 0 0); }
          50% { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 0 0 0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
