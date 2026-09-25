import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Send, Star, Check } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { reviewsApi } from "../../../api/reviews.api";
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
  hasReviewed?: boolean;
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
  hasReviewed: initialHasReviewed = false,
}: ApplicationWidgetProps) {
  const [hasReviewed, setHasReviewed] = useState(initialHasReviewed);
  const [checkingReview, setCheckingReview] = useState(false);

  useEffect(() => {
    setHasReviewed(initialHasReviewed);
  }, [initialHasReviewed]);

  useEffect(() => {
    if (application?.id && (project.status === 'completed' || project.status === 'closed') && (application.status === 'accepted' || application.status === 'completed')) {
      const checkReview = async () => {
        setCheckingReview(true);
        try {
          const res = await reviewsApi.listReviews({ project_id: project.id });
          const userHasReviewed = res.reviews.some(
            (r) => r.application_id === application.id
          );
          setHasReviewed(userHasReviewed);
        } catch (err) {
          console.error("Error al verificar reseña:", err);
        } finally {
          setCheckingReview(false);
        }
      };
      checkReview();
    }
  }, [application?.id, project.id, project.status, application?.status]);

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tu Postulación</h3>

      {application ? (
        <div className={cn(
          "rounded-2xl p-6 text-center space-y-5 border border-slate-200/80 bg-white transition-all",
          application.status === 'rejected' && "border-red-100 bg-red-50/30"
        )}>
          {/* Icon */}
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center mx-auto transition-colors",
            application.status === 'rejected'
              ? "bg-red-100 text-red-600"
              : "bg-indigo-50 text-indigo-600 border border-indigo-100/60"
          )}>
            {application.status === 'rejected' ? (
              <X className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>

          {/* Texts */}
          <div className="space-y-1.5">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              {application.status === 'completed' ? '¡Proyecto Finalizado!' :
                application.status === 'accepted' ? '¡Fuiste Seleccionado!' :
                  application.status === 'rejected' ? 'Postulación Rechazada' :
                    '¡Enviado!'}
            </h4>
            <p className="text-slate-600 text-xs font-normal leading-relaxed px-2">
              {application.status === 'completed' ? 'Has completado este proyecto con éxito.' :
                application.status === 'accepted' ? 'El empleador aceptó tu propuesta y el proyecto está en curso.' :
                  application.status === 'rejected' ? 'No fuiste seleccionado para este proyecto.' :
                    `Hemos enviado tu propuesta a ${companyName}.`}
            </p>
          </div>

          {/* Action button */}
          {(project.status === 'completed' || project.status === 'closed') && (application.status === 'accepted' || application.status === 'completed') ? (
            hasReviewed ? (
              <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Reseña enviada
              </div>
            ) : (
              <Button
                onClick={onOpenReviewModal}
                disabled={checkingReview}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-amber-600/10 shadow-none"
              >
                <Star className="h-4 w-4 fill-amber-200 text-amber-100" />
                {checkingReview ? "Cargando..." : "Dejar Reseña al Empleador"}
              </Button>
            )
          ) : (
            <Button
              onClick={onNavigateBack}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 rounded-xl transition-colors border border-slate-200/60 shadow-none"
            >
              Volver a Proyectos
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={coverNote}
              onChange={(e) => onCoverNoteChange(e.target.value)}
              placeholder="Escribe por qué eres ideal para este proyecto..."
              maxLength={500}
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-normal text-slate-800 min-h-36 resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
            />
            <div className="absolute bottom-3 right-4 text-[10px] font-medium text-slate-400">
              {coverNote.length}/500
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50/80 text-red-600 rounded-xl flex items-start gap-2 border border-red-100 text-xs">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="font-normal">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !coverNote.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-indigo-700/10 shadow-none disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-white/70" />
            ) : (
              <>
                Postular ahora <Send className="h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-slate-400 font-normal px-2">
            Tu perfil será compartido con el empleador.
          </p>
        </form>
      )}
    </div>
  );
}

