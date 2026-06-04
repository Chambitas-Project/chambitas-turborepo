import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, CheckCircle2, XCircle, Award, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import { StudentProfileModal } from "../components/organisms/StudentProfileModal";
import { ReviewModal } from "../components/organisms/ReviewModal";
import type { EmployerProject, ApplicationData } from "../api/employer.api";

export function EmployerProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<EmployerProject | null>(null);
  const [applicants, setApplicants] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewApplicationId, setReviewApplicationId] = useState<string | null>(null);
  const [reviewTargetName, setReviewTargetName] = useState<string | undefined>(undefined);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchProjectData = async () => {
    if (!id) return;
    try {
      const [projectData, applicantsData] = await Promise.all([
        employerApi.getProject(id),
        employerApi.getProjectApplicants(id)
      ]);
      setProject(projectData);
      setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
    } catch (error) {
      console.error("Error fetching project details", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchProjectData();
      setIsLoading(false);
    };
    init();
  }, [id]);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      setIsProcessingId(appId);
      await employerApi.updateApplicationStatus(appId, status);
      await fetchProjectData(); 
    } catch (error) {
      console.error("Error updating application status:", error);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleCompleteProject = async () => {
    if (!project) return;
    try {
      setIsCompleting(true);
      await employerApi.completeProject(project.id);
      await fetchProjectData();
    } catch (error) {
      console.error("Error completing project:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleOpenReview = (appId: string, name?: string) => {
    setReviewApplicationId(appId);
    setReviewTargetName(name);
    setIsReviewModalOpen(true);
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsProfileModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout role="employer">
        <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Cargando detalles...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout role="employer">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Proyecto no encontrado</h2>
          <Button variant="outline" onClick={() => navigate("/employer/projects")}>Volver a Mis Publicaciones</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer">
      <button 
        onClick={() => navigate("/employer/projects")} 
        className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-black transition-all mb-8 group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Publicaciones</span>
      </button>

      {/* Header del Proyecto */}
      <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div className="space-y-4 max-w-3xl flex-1">
            <div className="flex items-center gap-3 text-emerald-600">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Publicado {project.createdAt || 'recientemente'}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-slate-900">
              {project.title}
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed font-medium mt-6">
              {project.description || "Sin descripción proporcionada."}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 shrink-0">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presupuesto Estimado</p>
              <p className="text-3xl font-black text-slate-900">{project.budget ? `S/.${project.budget}` : '--'}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase">Precio por proyecto</p>
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
            <div className="h-3 w-full bg-slate-100 rounded-md overflow-hidden">
              <div className="h-full bg-indigo-500 w-1/2 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Postulantes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900">
              {project.status === 'in_progress' || project.status === 'completed' ? 'Estudiante Seleccionado' : 'Postulantes'}
            </h2>
            <Badge className="bg-emerald-50 text-emerald-700 font-black px-2.5 py-0.5 rounded-md">
              {project.status === 'in_progress' || project.status === 'completed' ? '1' : applicants.length}
            </Badge>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-md border border-slate-100 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Aún no hay postulantes</h3>
            <p className="text-slate-500 font-medium mt-1">Los estudiantes que apliquen aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {(project.status === 'in_progress' || project.status === 'completed' 
                ? applicants.filter(a => a.status === 'accepted') 
                : applicants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              ).map(app => (
              <div key={app.id} className={cn(
                "p-6 rounded-md border transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden",
                app.status === 'accepted' ? "bg-emerald-50 border-emerald-200" :
                app.status === 'rejected' ? "bg-red-50 border-red-100 opacity-60" :
                "bg-white border-slate-100 hover:border-emerald-200 shadow-sm group"
              )}>
                {app.status === 'accepted' && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
                )}

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0 mt-1 sm:mt-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.student_name || app.student_id}`} alt="Avatar" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {app.student_name || `Estudiante #${(app.student_id || '').substring(0, 5)}`}
                      </h4>
                      {app.match_score !== undefined && app.match_score > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 text-[10px] flex items-center gap-1 rounded-md">
                          <Award className="h-3 w-3" /> MATCH {(app.match_score * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      "{app.cover_note || "Sin carta de presentación"}"
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs font-bold text-slate-400">
                        {(app.applied_at || app.created_at) ? `Postuló el ${new Date(app.applied_at || app.created_at!).toLocaleDateString()}` : ''}
                      </span>
                      {app.status === 'accepted' && (
                        <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aceptado
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="text-xs font-black text-red-500 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Rechazado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0 shrink-0">
                  <Button 
                    variant="outline" 
                    onClick={() => handleViewProfile(app.student_id || '')}
                    className="flex-1 sm:flex-none border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 cursor-pointer rounded-md"
                  >
                    Ver Perfil
                  </Button>
                  
                  {project.status === 'in_progress' && app.status === 'accepted' && (
                    <Button 
                      onClick={handleCompleteProject}
                      disabled={isCompleting}
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-sm rounded-md"
                    >
                      {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                      Finalizar Proyecto
                    </Button>
                  )}

                  {project.status === 'completed' && app.status === 'accepted' && (
                    <Button 
                      onClick={() => handleOpenReview(app.id, app.student_name || '')}
                      className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow-sm rounded-md"
                    >
                      Dejar Reseña
                    </Button>
                  )}

                  {project.status !== 'in_progress' && project.status !== 'completed' && app.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        disabled={isProcessingId === app.id}
                        className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 font-bold cursor-pointer rounded-md"
                      >
                        {isProcessingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                        Rechazar
                      </Button>
                      <Button 
                        onClick={() => handleUpdateStatus(app.id, 'accepted')}
                        disabled={isProcessingId === app.id}
                        className="flex-1 sm:flex-none bg-[#065f46] hover:bg-[#064e3b] text-white font-bold cursor-pointer shadow-sm rounded-md"
                      >
                        {isProcessingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                        Aceptar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            </div>
            
            {/* Pagination Controls */}
            {project.status !== 'in_progress' && project.status !== 'completed' && applicants.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 p-0 rounded-md border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(applicants.length / ITEMS_PER_PAGE) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "h-10 w-10 rounded-md font-bold text-sm transition-colors",
                        currentPage === i + 1 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(applicants.length / ITEMS_PER_PAGE), prev + 1))}
                  disabled={currentPage === Math.ceil(applicants.length / ITEMS_PER_PAGE)}
                  className="h-10 w-10 p-0 rounded-md border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <StudentProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        studentId={selectedStudentId}
      />
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        applicationId={reviewApplicationId}
        targetName={reviewTargetName}
        onSuccess={() => fetchProjectData()}
      />

    </DashboardLayout>
  );
}
