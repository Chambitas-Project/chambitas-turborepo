import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@chambitas/ui";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import { StudentProfileModal } from "../components/organisms/StudentProfileModal";
import { ReviewModal } from "../components/organisms/ReviewModal";

// Types
import type { EmployerProject, ApplicationData } from "../features/employer-project/types";

// Components
import { EmployerProjectHeader } from "../features/employer-project/components/EmployerProjectHeader";
import { ApplicantsList } from "../features/employer-project/components/ApplicantsList";

export function EmployerProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<EmployerProject | null>(null);
  const [applicants, setApplicants] = useState<ApplicationData[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

      <EmployerProjectHeader project={project} />

      <ApplicantsList
        project={project}
        applicants={applicants}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        isProcessingId={isProcessingId}
        isCompleting={isCompleting}
        handleUpdateStatus={handleUpdateStatus}
        handleViewProfile={handleViewProfile}
        handleCompleteProject={handleCompleteProject}
        handleOpenReview={handleOpenReview}
      />

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        studentId={selectedStudentId}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        applicationId={reviewApplicationId || undefined}
        targetName={reviewTargetName}
      />
    </DashboardLayout>
  );
}
