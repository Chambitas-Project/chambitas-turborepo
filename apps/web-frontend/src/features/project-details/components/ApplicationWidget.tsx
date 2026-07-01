import { X, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import type { Project } from "../types";

interface ApplicationWidgetProps {
  application: any;
  project: Project;
  companyName: string;
  isSubmitting: boolean;
  error: string | null;
  coverNote: string;
  onCoverNoteChange: (note: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenReviewModal: () => void;
  onNavigateBack: () => void;
}

export function ApplicationWidget({
  application,
  project,
  companyName,
  isSubmitting,
  error,
  coverNote,
  onCoverNoteChange,
  onSubmit,
  onOpenReviewModal,
  onNavigateBack,
}: ApplicationWidgetProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tu Postulación</h3>

      {application ? (
        <div className={cn(
          "rounded-xl p-8 text-white text-center space-y-6 shadow-xl",
          (application.status === 'accepted' || application.status === 'completed') ? "bg-indigo-600 shadow-indigo-200" :
            application.status === 'rejected' ? "bg-red-500 shadow-red-200" :
              "bg-emerald-600 shadow-emerald-200"
        )}>
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto border border-white/30">
            {application.status === 'rejected' ? <X className="h-8 w-8 text-white" /> : <CheckCircle2 className="h-8 w-8 text-white" />}
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black tracking-tight">
              {application.status === 'completed' ? '¡Proyecto Finalizado!' :
                application.status === 'accepted' ? '¡Fuiste Seleccionado!' :
                  application.status === 'rejected' ? 'Postulación Rechazada' :
                    '¡Enviado!'}
            </h4>
            <p className="text-white/90 text-sm font-medium">
              {application.status === 'completed' ? 'Has completado este proyecto con éxito.' :
                application.status === 'accepted' ? 'El empleador aceptó tu propuesta y el proyecto está en curso.' :
                  application.status === 'rejected' ? 'No fuiste seleccionado para este proyecto.' :
                    `Hemos enviado tu propuesta a ${companyName}.`}
            </p>
          </div>

          {(project.status === 'completed' || project.status === 'closed') && (application.status === 'accepted' || application.status === 'completed') ? (
            <Button onClick={onOpenReviewModal} className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-6 rounded-md transition-all shadow-md shadow-amber-900/20">
              Dejar Reseña al Empleador
            </Button>
          ) : (
            <Button onClick={onNavigateBack} className="w-full bg-white text-slate-900 hover:bg-slate-50 font-black py-6 rounded-md transition-all">
              Volver a Proyectos
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="relative group">
            <textarea
              value={coverNote}
              onChange={(e) => onCoverNoteChange(e.target.value)}
              placeholder="Escribe por qué eres ideal para este proyecto..."
              maxLength={500}
              className="w-full bg-white border border-slate-200 rounded-md p-5 text-sm font-medium text-slate-900 min-h-40 resize-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all placeholder:text-slate-400 shadow-sm"
            />
            <div className="absolute bottom-6 right-8 text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {coverNote.length}/500
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md flex flex-col gap-1 border border-red-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase">Error de Postulación</p>
              </div>
              <p className="text-[10px] font-medium leading-tight">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !coverNote.trim()}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-md shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:bg-slate-400 disabled:text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            ) : (
              <>
                Postular ahora <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">
            Tu perfil será compartido con el empleador.
          </p>
        </form>
      )}
    </div>
  );
}
