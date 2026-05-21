import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { employerApi } from "../api/employer.api";
import type { EmployerProject, ApplicationData } from "../api/employer.api";

export function EmployerProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<EmployerProject | null>(null);
  const [applicants, setApplicants] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [projectData, applicantsData] = await Promise.all([
          employerApi.getProject(id),
          employerApi.getProjectApplicants(id)
        ]);
        setProject(projectData);
        setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
      } catch (error) {
        console.error("Error fetching project details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a publicaciones
      </button>

      {/* Header del Proyecto */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 py-1.5",
                project.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                project.status === 'pending' ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-500"
              )}>
                {project.status === 'active' ? 'ACTIVO' : project.status === 'pending' ? 'PENDIENTE' : 'COMPLETADO'}
              </Badge>
              <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Publicado {project.createdAt || 'recientemente'}
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">{project.title}</h1>
            
            <p className="text-slate-600 font-medium leading-relaxed">
              {project.description || "Sin descripción proporcionada."}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center min-w-[200px] shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presupuesto</span>
            <span className="text-3xl font-black text-emerald-700">{project.budget || '--'}</span>
          </div>
        </div>
      </div>

      {/* Lista de Postulantes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900">Postulantes</h2>
            <Badge className="bg-emerald-50 text-emerald-700 font-black px-2.5 py-0.5">{applicants.length}</Badge>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Aún no hay postulantes</h3>
            <p className="text-slate-500 font-medium mt-1">Los estudiantes que apliquen aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applicants.map(app => (
              <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-emerald-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0 mt-1 sm:mt-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.student_id}`} alt="Avatar" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Estudiante #{app.student_id.substring(0, 5)}</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2">{app.cover_note || "Sin carta de presentación"}</p>
                    <span className="text-xs font-bold text-slate-400 mt-2 block">{app.created_at ? `Postuló el ${new Date(app.created_at).toLocaleDateString()}` : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                  <Button variant="outline" className="flex-1 sm:flex-none border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900">
                    Ver Perfil
                  </Button>
                  <Button className="flex-1 sm:flex-none bg-[#065f46] hover:bg-[#064e3b] text-white font-bold">
                    Aceptar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
