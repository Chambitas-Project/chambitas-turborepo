import { useState } from "react";
import { X, Star, Loader2, Send } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { reviewsApi } from "../../api/reviews.api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | null;
  targetName?: string;
  onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, applicationId, targetName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;
    if (rating === 0) {
      setError("Por favor selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await reviewsApi.createReview({
        application_id: applicationId,
        rating,
        comment
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating review", err);
      setError(err?.response?.data?.message || "Ocurrió un error al enviar la reseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">Dejar una Reseña</h2>
          <button onClick={onClose} className="h-8 w-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="review-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2 text-center">
              <p className="text-sm font-bold text-slate-500">¿Cómo fue tu experiencia trabajando con {targetName || 'esta persona'}?</p>
              
              <div className="flex justify-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(star);
                      setError(null);
                    }}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star 
                      className={cn(
                        "h-10 w-10 transition-colors",
                        (hoverRating || rating) >= star 
                          ? "fill-amber-400 text-amber-400" 
                          : "fill-slate-100 text-slate-200 hover:text-amber-200"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Comentario <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <textarea 
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-slate-50 border-none rounded-xl p-4 w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                placeholder="Escribe aquí tu retroalimentación detallada..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-12 px-6 rounded-md font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Cancelar
          </Button>
          <Button type="submit" form="review-form" disabled={loading} className="h-12 px-6 rounded-md font-black bg-[#065f46] hover:bg-[#064e3b] text-white cursor-pointer shadow-none">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Enviar Reseña</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
