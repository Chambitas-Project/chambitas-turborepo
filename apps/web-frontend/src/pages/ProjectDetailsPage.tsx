import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Zap,
  ShieldCheck,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  X
} from "lucide-react";
import { Button, Badge } from "@chambitas/ui";
import { apiClient } from "../api/api-client";
import { ReviewModal } from "../components/organisms/ReviewModal";

// Helper nativo para tiempo relativo sin dependencias externas
function formatTimeAgo(dateString: string) {
  if (!dateString) return "recientemente";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "hace unos segundos";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} horas`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `hace ${diffInDays} días`;
  return past.toLocaleDateString();
}

interface ProjectSkill {
  skill_id: string;
  skill_name: string;
  min_proficiency: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budget_type: "fixed" | "hourly";
  company_name: string;
  service_category: string;
  requirements?: string;
  skills: ProjectSkill[];
  created_at: string;
  status: string;
}

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjectAndApplication = async () => {
      try {
        const [projectRes, appsRes] = await Promise.all([
          apiClient.get(`/marketplace/projects/${id}`),
          apiClient.get(`/marketplace/applications/my-applications`)
        ]);
        
        setProject(projectRes.data);
        
        const myApps = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data?.applications || []);
        const myApp = myApps.find((app: any) => app.project_id === id);
        
        if (myApp) {
          setApplication(myApp);
        }
      } catch (err) {
        console.error("Error fetching project or applications:", err);
        setError("No pudimos cargar los detalles del proyecto.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAndApplication();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverNote.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post("/marketplace/applications", {
        project_id: id,
        cover_note: coverNote
      });
      setApplication(res.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      // Manejo mejorado para errores de backend (como el 503/Circuit Open provocado por el rechazo de habilidades)
      const errorMsg = err.response?.data?.message || err.message || "Error de conexión";
      if (err.response?.status === 503) {
        setError("No cumples con las habilidades obligatorias de esta postulación (o el servicio está ocupado).");
      } else {
        setError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
      <p className="text-slate-400 font-bold animate-pulse tracking-tight">Cargando oportunidad...</p>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center space-y-6">
      <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900">Proyecto no encontrado</h2>
      <Button onClick={() => navigate("/jobs")} className="bg-slate-900 text-white rounded-xl font-bold px-8">Volver al Marketplace</Button>
    </div>
  );

  const timeAgo = formatTimeAgo(project.created_at);
  const companyName = project.company_name || (project as any).companyName || "Chambitas Client";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="w-full px-6 md:px-10 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-black transition-all group"
          >
            <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="hidden sm:inline">Marketplace</span>
          </button>

          <div className="flex items-center gap-4">
            <Badge className="bg-emerald-50 text-emerald-700 border-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{project.service_category}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <History className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">

          <div className="lg:col-span-8 2xl:col-span-9 border-r border-slate-100 min-h-screen">
            <div className="p-6 md:p-10 lg:pl-16 space-y-8 border-b border-slate-50">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Publicado {timeAgo}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900">
                  {project.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presupuesto Estimado</p>
                  <p className="text-3xl font-black text-slate-900">S/.{project.budget}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">{project.budget_type === "hourly" ? "Tarifa por hora" : "Precio por proyecto"}</p>
                </div>
                <div className="h-14 w-px bg-slate-100 hidden sm:block" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className={cn(
                      "h-3 w-3 rounded-full animate-pulse",
                      project.status === 'active' ? "bg-emerald-500" :
                      project.status === 'in_progress' ? "bg-indigo-500" :
                      "bg-slate-400"
                    )} />
                    <p className="text-base font-black text-slate-900 uppercase">
                      {project.status === 'active' ? 'Abierto' :
                       project.status === 'in_progress' ? 'En Progreso' :
                       project.status === 'pending' ? 'Pendiente' : 'Completado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar para Proyectos en Progreso */}
              {project.status === 'in_progress' && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" /> Tiempo del Proyecto
                    </h3>
                    <span className="text-xs font-bold text-slate-500">En ejecución</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-1/2 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 md:p-10 lg:pl-16 space-y-12 pb-20">
              <div className="max-w-4xl space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Sobre el Proyecto</h3>
                <p className="text-lg text-slate-600 leading-relaxed font-medium selection:bg-emerald-100">
                  {project.description}
                </p>
              </div>



              <div className="space-y-8">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Habilidades Técnicas</h3>
                <div className="flex flex-wrap gap-3">
                  {project.skills.map(skill => (
                    <span key={skill.skill_id} className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black tracking-tight hover:scale-105 transition-transform cursor-default">
                      {skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-10 border-t border-slate-100">
                <div className="space-y-4">
                  <Zap className="h-6 w-6 text-amber-500" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel</p>
                    <p className="text-base font-black">Intermedio</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Calendar className="h-6 w-6 text-emerald-500" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrega</p>
                    <p className="text-base font-black">Flexible</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <ShieldCheck className="h-6 w-6 text-blue-500" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seguridad</p>
                    <p className="text-base font-black">Pago en Escrow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 2xl:col-span-3 bg-slate-50/50 border-l border-slate-100">
            <div className="sticky top-20 p-6 md:p-10 lg:pr-16 space-y-10">
              <div className="space-y-8">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Publicado por</h3>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm">
                    {companyName[0]}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900">{companyName}</h4>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-900" />
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Tu Postulación</h3>
                </div>

                {application ? (
                  <div className={cn(
                    "rounded-[2.5rem] p-10 text-white text-center space-y-6 shadow-2xl",
                    application.status === 'accepted' ? "bg-indigo-600 shadow-indigo-200" :
                    application.status === 'rejected' ? "bg-red-500 shadow-red-200" :
                    "bg-emerald-600 shadow-emerald-200"
                  )}>
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto border border-white/30">
                      {application.status === 'rejected' ? <X className="h-8 w-8 text-white" /> : <CheckCircle2 className="h-8 w-8 text-white" />}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black tracking-tight">
                        {application.status === 'accepted' ? '¡Fuiste Seleccionado!' : 
                         application.status === 'rejected' ? 'Postulación Rechazada' :
                         '¡Enviado!'}
                      </h4>
                      <p className="text-white/90 text-sm font-medium">
                        {application.status === 'accepted' ? 'El empleador aceptó tu propuesta y el proyecto está en curso.' :
                         application.status === 'rejected' ? 'No fuiste seleccionado para este proyecto.' :
                         `Hemos enviado tu propuesta a ${companyName}.`}
                      </p>
                    </div>

                    {project.status === 'completed' && application.status === 'accepted' ? (
                      <Button onClick={() => setIsReviewModalOpen(true)} className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-amber-900/20">
                        Dejar Reseña al Empleador
                      </Button>
                    ) : (
                      <Button onClick={() => navigate("/jobs")} className="w-full bg-white text-slate-900 hover:bg-slate-50 font-black py-6 rounded-2xl transition-all">
                        Volver al Marketplace
                      </Button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-6">
                    <div className="relative group">
                      <textarea
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder="Escribe por qué eres ideal para este proyecto..."
                        maxLength={500}
                        className="w-full bg-white border-2 border-slate-100 rounded-[2rem] p-8 text-base font-bold text-slate-900 min-h-[250px] resize-none focus:border-slate-900 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                      />
                      <div className="absolute bottom-6 right-8 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {coverNote.length}/500
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex flex-col gap-1 border border-red-100">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-[10px] font-black uppercase">Error de Postulación</p>
                        </div>
                        <p className="text-[10px] font-medium leading-tight">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting || !coverNote.trim()}
                      className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-[2rem] text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                      {submitting ? (
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
            </div>
          </div>
        </div>
      </main>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        applicationId={application?.id}
        targetName={companyName}
      />
    </div>
  );
}
