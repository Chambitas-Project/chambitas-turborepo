import { Card, CardContent, Badge, Button, cn } from "@chambitas/ui";
import { Clock, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EmployerProject } from "../../services/employer.service";

export function ProjectListItem({ project }: { project: EmployerProject }) {
  const navigate = useNavigate();

  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden group">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-slate-800">{project.title}</h3>
            <Badge className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-1",
              project.status === 'active' ? "bg-emerald-100 text-emerald-700" :
              project.status === 'pending' ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-500"
            )}>
              {project.status === 'active' ? 'ACTIVO' : project.status === 'pending' ? 'PENDIENTE DE APROBACIÓN' : 'COMPLETADO'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> 
              {project.status === 'completed' ? `Completado ${project.createdAt || 'hace poco'}` : `Publicado ${project.createdAt || 'hace poco'}`}
            </span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {project.budget}</span>
            {project.status === 'completed' && project.contracted ? (
               <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Contratado: {project.contracted}</span>
            ) : (
               <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {project.applicantCount} Postulantes</span>
            )}
          </div>
        </div>
        <Button 
          variant="secondary" 
          onClick={(e) => {
            e.stopPropagation();
            if (project.status !== 'completed') navigate(`/employer/projects/${project.id}`);
          }}
          className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-6 rounded-xl border border-slate-100 cursor-pointer"
        >
          {project.status === 'completed' ? 'Archivar' : 'Revisar'}
        </Button>
      </CardContent>
    </Card>
  );
}
