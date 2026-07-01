import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { reviewsApi, type ReviewData } from "../../api/reviews.api";

interface ReviewsListProps {
  userId: string;
  role: "student" | "employer";
}

export function ReviewsList({ userId, role }: ReviewsListProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewsApi.listReviews(
          role === "student" ? { student_id: userId } : { employer_id: userId }
        );
        // Filtramos para mostrar solo las reseñas dirigidas a este usuario.
        // Si role = student, queremos mostrar reseñas cuyo reviewer_role = 'employer' (porque se la dejaron a él).
        // Si role = employer, queremos mostrar reseñas cuyo reviewer_role = 'student'.
        const filtered = res.reviews.filter(r => r.reviewer_role !== role);
        setReviews(filtered);

        // Calcular promedio manualmente sobre las reseñas recibidas
        if (filtered.length > 0) {
          const sum = filtered.reduce((acc, curr) => acc + curr.rating, 0);
          setAverage(sum / filtered.length);
        }
      } catch (err) {
        console.error("Error fetching reviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [userId, role]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mb-2" />
        <p className="text-sm font-bold text-slate-400">Cargando reseñas...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-4">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-700">No hay reseñas aún</h3>
        <p className="text-slate-500 font-medium text-sm mt-1">
          {role === 'student'
            ? 'Completa proyectos exitosamente para recibir retroalimentación.'
            : 'Contrata estudiantes y finaliza proyectos para comenzar a recibir reseñas.'}
        </p>
      </div>
    );
  }

  const paginatedReviews = reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Reseñas Recibidas</h2>
          <p className="text-sm font-medium text-slate-500">Lo que dicen otros sobre ti</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="flex items-center text-amber-400">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900">{average.toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-400 ml-1">/ 5</span>
          </div>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <span className="text-sm font-bold text-slate-500">{reviews.length} reseñas</span>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedReviews.map((review) => (
          <div key={review.id} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex gap-4 transition-colors hover:bg-slate-50">
            <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0 overflow-hidden border-2 border-white shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer_id}`} alt="Avatar" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-sm font-black text-slate-900">{review.reviewer_name || `Usuario ${review.reviewer_id.substring(0, 5)}`}</span>
                <span className="text-xs font-bold text-slate-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn("h-3.5 w-3.5", star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                "{review.comment || 'Sin comentario.'}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(reviews.length / ITEMS_PER_PAGE) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "h-8 w-8 rounded-xl font-bold text-xs transition-colors",
                  currentPage === i + 1
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(reviews.length / ITEMS_PER_PAGE), prev + 1))}
            disabled={currentPage === Math.ceil(reviews.length / ITEMS_PER_PAGE)}
            className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
