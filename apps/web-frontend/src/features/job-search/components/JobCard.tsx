import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import { type Project } from "../types";

interface JobCardProps {
  project: Project;
  matchScore?: number;
  hasApplied?: boolean;
}

export function JobCard({ project, matchScore, hasApplied }: JobCardProps) {
  const navigate = useNavigate();
  const projectId = project.id || (project as any).project_id || (project as any)._id;

  const handleNavigate = () => {
    if (projectId) navigate(`/projects/${projectId}`);
  };

  const budget = project.budget || 0;
  const company = project.company_name || project.employer_name || "Empleador Confidencial";

  const statusText = project.status === 'active' ? 'Abierto' :
    project.status === 'in_progress' ? 'En Progreso' :
      project.status === 'pending' ? 'Pendiente' :
        project.status === 'completed' ? 'Completado' : 'Abierto';

  const createdDate = project.created_at ? new Date(project.created_at) : new Date();
  const daysAgo = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
  const timeAgoText = daysAgo === 0 ? 'hace unas horas' : `hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}`;

  return (
    <div
      onClick={handleNavigate}
      className="bg-white rounded-[20px] p-6 border border-slate-200 hover:border-emerald-200 transition-all group cursor-pointer"
    >
      <div className="flex flex-col gap-5">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-100">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${company}&backgroundColor=0f172a`} alt={company} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1 mt-0.5">
              <h4 className="text-[19px] font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors duration-300">
                {project.title}
              </h4>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Building2 className="h-4 w-4" />
                <span>{company}</span>
                <span>•</span>
                <span className={cn("font-bold", project.status === 'active' || project.status === 'open' || !project.status ? "text-emerald-600" : "text-slate-500")}>{statusText}</span>
                <span>•</span>
                <span>{timeAgoText}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
            {matchScore !== undefined && matchScore > 0 && (
              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-none">
                <CheckCircle2 className="h-3.5 w-3.5" /> {(matchScore * 100).toFixed(0)}% de Coincidencia
              </Badge>
            )}
            <p className="text-[22px] font-black text-slate-900">S/.{budget}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
          {project.description}
        </p>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap gap-2">
            {(project.skills || []).slice(0, 4).map((skill, idx) => {
              const skillName = typeof skill === "string" ? skill : skill.skill_name;
              return (
                <span key={idx} className="px-4 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium border border-slate-200">
                  {skillName}
                </span>
              );
            })}
          </div>
          {hasApplied ? (
            <span className="w-full sm:w-auto bg-slate-50 text-slate-600 font-bold px-6 h-11 flex items-center justify-center rounded-lg border border-slate-200 cursor-default">
              Postulaste
            </span>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (projectId) navigate(`/projects/${projectId}`);
              }}
              className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-6 h-11 rounded-md transition-colors shadow-none hover:shadow-none border-0"
            >
              Postular ahora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
