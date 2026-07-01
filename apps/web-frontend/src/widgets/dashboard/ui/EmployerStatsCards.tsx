import { useNavigate } from "react-router-dom";
import type { EmployerStats } from "../../../api/employer.api";
import { StatCard } from "../../../components/molecules/StatCard";

export function EmployerStatsCards({ stats }: { stats: EmployerStats | null }) {
  const navigate = useNavigate();

  if (!stats) return null; // or a skeleton

  const handleScrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <StatCard 
        title="PUBLICACIONES ACTIVAS" 
        value={stats.activeJobs.toString()} 
        trend={stats.activeJobsTrend} 
        color="emerald" 
        onClick={() => navigate('/employer/projects')}
      />
      <StatCard 
        title="NUEVOS POSTULANTES" 
        value={stats.newApplicants.toString()} 
        trend={stats.newApplicantsTrend} 
        color="blue" 
        onClick={() => navigate('/employer/projects')}
      />
      <StatCard 
        title="REVISIONES PENDIENTES" 
        value={stats.pendingReviews.toString().padStart(2, '0')} 
        trend={stats.pendingReviewsTrend} 
        color="amber" 
        onClick={handleScrollToReviews}
      />
    </div>
  );
}


