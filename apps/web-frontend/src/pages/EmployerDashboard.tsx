import { useState, useEffect } from "react";
import { 
  Plus, 
  Clock, 
  TrendingUp, 
  Users,
  ChevronRight,
  FileText,
  Bell
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, cn } from "@chambitas/ui";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EmployerStatsCards } from "../widgets/dashboard/ui/EmployerStatsCards";

interface Project {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed';
  createdAt: string;
  budget: string;
  applicantCount: number;
}

export function EmployerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data para el diseño
        setProjects([
          { id: '1', title: 'Diseñador UI/UX Junior para Web App', status: 'active', createdAt: 'hace 2h', budget: '$45.00/hr', applicantCount: 12 },
          { id: '2', title: 'Creador de Contenido para Redes Sociales', status: 'pending', createdAt: 'hace 1d', budget: '$200 Fijo', applicantCount: 4 },
          { id: '3', title: 'Especialista en Entrada de Datos', status: 'completed', createdAt: 'hace 3d', budget: '$50.00', applicantCount: 1 },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout role="employer">
      {/* Header de Bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Panel del Empleador</h1>
          <p className="text-slate-500 font-medium">Bienvenido de nuevo, esto es lo que está pasando con tus microtrabajos hoy.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold h-12 px-6 rounded-xl shadow-sm">
            <FileText className="h-4 w-4 mr-2" /> Reportes
          </Button>
          <Button className="bg-[#2D7A5F] hover:bg-[#23614a] text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-emerald-900/10">
            <Plus className="h-5 w-5 mr-2 border-2 border-white/50 rounded-full" /> Publicar Microtrabajo
          </Button>
        </div>
      </div>

      <EmployerStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Listado de Publicaciones (8 col) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-slate-900">Publicaciones Recientes</h2>
            <button className="text-sm font-bold text-emerald-700 hover:underline">Ver todos los empleos</button>
          </div>

          <div className="space-y-4">
            {projects.map(project => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Sidebar de Actividad (4 col) */}
        <div className="lg:col-span-4 space-y-6">
          <RecentActivityCard />
          <CompleteProfileCard />
        </div>

      </div>
    </DashboardLayout>
  );
}

// Sub-componentes internos (Organismos/Moléculas locales)
function ProjectListItem({ project }: { project: Project }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden group">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-slate-800">{project.title}</h3>
            <Badge className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2",
              project.status === 'active' ? "bg-emerald-100 text-emerald-700" :
              project.status === 'pending' ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-500"
            )}>
              {project.status === 'active' ? 'ACTIVO' : project.status === 'pending' ? 'PENDIENTE' : 'COMPLETADO'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {project.createdAt}</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {project.budget}</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {project.applicantCount} Postulantes</span>
          </div>
        </div>
        <Button variant="secondary" className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-6 rounded-xl border border-slate-100">
          Revisar
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentActivityCard() {
  return (
    <Card className="border-none shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-black">Actividad Reciente</CardTitle>
        <Bell className="h-5 w-5 text-slate-300" />
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-6">
        <ActivityItem user="Marco Polo" action="postuló a" target='"Diseñador UI"' time="hace 5 min" color="emerald" />
        <ActivityItem user="Sarah Connor" action="te envió un mensaje" time="hace 1 hora" color="blue" />
        <button className="w-full pt-4 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
          Ver Toda la Actividad
        </button>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ user, action, target, time, color }: any) {
  return (
    <div className="flex gap-4 group">
      <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", 
        color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
      )} />
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-600 leading-tight">
          <span className="font-black text-slate-900">{user} </span>
          {action} <span className="font-black text-slate-900">{target}</span>
        </p>
        <p className="text-[10px] font-bold text-slate-300">{time}</p>
      </div>
    </div>
  );
}

function CompleteProfileCard() {
  return (
    <Card className="bg-emerald-50/50 border-emerald-100/50 border shadow-none rounded-3xl p-8">
       <h4 className="text-emerald-900 font-black mb-2">Perfil de Empresa</h4>
       <div className="space-y-4">
          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 w-[75%]" />
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-800 hover:gap-3 transition-all">
            TERMINAR CONFIGURACIÓN <ChevronRight className="h-3 w-3" />
          </button>
       </div>
    </Card>
  );
}
