import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2, History } from "lucide-react";
import { Button, Badge } from "@chambitas/ui";
import { apiClient } from "../api/api-client";
import { ReviewModal } from "../components/organisms/ReviewModal";
import React from "react";

// Types
import { type Project, formatTimeAgo } from "../features/project-details/types";

// Components
import { ProjectHeader } from "../features/project-details/components/ProjectHeader";
import { ProjectInfo } from "../features/project-details/components/ProjectInfo";
import { EmployerProfileCard } from "../features/project-details/components/EmployerProfileCard";
import { ApplicationWidget } from "../features/project-details/components/ApplicationWidget";
import { useUxTelemetry } from "../hooks/useUxTelemetry";

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { completeStep } = useUxTelemetry('StudentApplication', 'ProjectDetails');

  // Data State
  const [project, setProject] = useState<Project | null>(null);
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [employerProjectsCount, setEmployerProjectsCount] = useState<number>(0);
  const [employerReviews, setEmployerReviews] = useState<any[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [matchScore, setMatchScore] = useState<number | undefined>(undefined);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjectAndApplication = async () => {
      try {
        const [projectRes, appsRes, recsRes] = await Promise.all([
          apiClient.get(`/marketplace/projects/${id}`),
          apiClient.get(`/marketplace/applications/my-applications`).catch(() => ({ data: [] })),
          apiClient.get(`/matching/recommendations/me`).catch(() => ({ data: [] }))
        ]);

        const projData = projectRes.data;
        setProject(projData);

        const myApps = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data?.applications || []);
        const myApp = myApps.find((app: any) => app.project_id === id);

        if (myApp) {
          setApplication(myApp);
        }

        const recs = Array.isArray(recsRes.data) ? recsRes.data : (recsRes.data?.recommendations || []);
        const currentMatch = recs.find((r: any) => r.jobId === id);
        if (currentMatch) {
          setMatchScore(currentMatch.score);
        }

        // Fetch employer profile and stats
        if (projData.employer_id) {
          try {
            const [profileRes, projectsRes, reviewsRes] = await Promise.all([
              apiClient.get(`/profile/id/${projData.employer_id}`).catch(() => ({ data: null })),
              apiClient.get(`/marketplace/projects?employerId=${projData.employer_id}`).catch(() => ({ data: { projects: [] } })),
              apiClient.get(`/marketplace/reviews?employer_id=${projData.employer_id}`).catch(() => ({ data: { reviews: [] } }))
            ]);

            setEmployerProfile(profileRes.data);
            setEmployerProjectsCount(Array.isArray(projectsRes.data?.projects) ? projectsRes.data.projects.length : (Array.isArray(projectsRes.data) ? projectsRes.data.length : 0));
            setEmployerReviews(Array.isArray(reviewsRes.data?.reviews) ? reviewsRes.data.reviews : (Array.isArray(reviewsRes.data) ? reviewsRes.data : []));
          } catch (err) {
            console.error("No se pudo cargar la información completa del empleador");
          }
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
      completeStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
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
      <Button onClick={() => navigate("/jobs")} className="bg-slate-900 text-white rounded-md font-bold px-8">Volver a Proyectos</Button>
    </div>
  );

  const timeAgo = formatTimeAgo(project.created_at);
  const companyName = project.company_name || project.employer_name || "Empleador Confidencial";
  const employerName = project.employer_name || "Usuario Anónimo";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="w-full px-6 md:px-10 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-black transition-all group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Proyectos</span>
          </button>

          <div className="flex items-center gap-4">
            <Badge className="bg-emerald-50 text-emerald-700 border-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              {project.service_category}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <History className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">

          <div className="lg:col-span-8 2xl:col-span-9 border-r border-slate-100">
            <ProjectHeader project={project} timeAgo={timeAgo} matchScore={matchScore} />
            <ProjectInfo project={project} />
          </div>

          <div className="lg:col-span-4 2xl:col-span-3 bg-slate-50/50 border-l border-slate-100">
            <div className="sticky top-20 p-6 md:p-10 lg:pr-16 space-y-10">
              <EmployerProfileCard
                companyName={companyName}
                employerName={employerName}
                employerProfile={employerProfile}
                employerProjectsCount={employerProjectsCount}
                employerReviews={employerReviews}
              />
              <ApplicationWidget
                application={application}
                project={project}
                companyName={companyName}
                isSubmitting={isSubmitting}
                error={error}
                coverNote={coverNote}
                onCoverNoteChange={setCoverNote}
                onSubmit={handleApply}
                onOpenReviewModal={() => setIsReviewModalOpen(true)}
                onNavigateBack={() => navigate("/jobs")}
              />
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
