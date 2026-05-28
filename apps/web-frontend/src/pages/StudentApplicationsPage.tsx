import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  ExternalLink,
  CalendarDays,
  Loader2
} from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import { apiClient } from "../api/api-client";
import { DashboardNavbar } from "../widgets/navbar/ui/DashboardNavbar";

interface Application {
  id: string;
  project_id: string;
  status: string;
  cover_note: string;
  applied_at: string;
  project_title?: string;
}

export function StudentApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiClient.get("/marketplace/applications/my-applications");
        const data = Array.isArray(response.data) ? response.data : (response.data?.applications || []);
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    switch (s) {
      case 'accepted':
      case 'approved':
        return {
          label: 'Aceptada',
          icon: <CheckCircle2 className="h-3 w-3" />,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'rejected':
      case 'declined':
        return {
          label: 'Rechazada',
          icon: <XCircle className="h-3 w-3" />,
          classes: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          label: 'Pendiente',
          icon: <Clock className="h-3 w-3" />,
          classes: 'bg-amber-50 text-amber-700 border-amber-200'
        };
    }
  };

  const filteredApplications = applications.filter(app =>
    (app.project_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.cover_note || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <DashboardNavbar role="student" />

      <main className="max-w-5xl mx-auto px-4 py-10 md:py-16 space-y-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Mis Postulaciones</h1>
            <p className="text-lg text-slate-500 font-medium">Haz seguimiento a todos los empleos a los que te has presentado.</p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar postulaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-700 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse">Cargando tus postulaciones...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center space-y-6">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
              <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-2xl font-black text-slate-900">Aún no hay postulaciones</h3>
              <p className="text-slate-500 font-medium leading-relaxed">No te has presentado a ningún proyecto todavía. ¡El empleo perfecto te está esperando!</p>
            </div>
            <Button onClick={() => navigate("/jobs")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">
              Explorar Empleos <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-4xl p-12 text-center space-y-4 shadow-sm border border-slate-100">
            <Search className="h-12 w-12 text-slate-200 mx-auto" />
            <h3 className="text-xl font-black text-slate-900">Sin coincidencias</h3>
            <p className="text-slate-400 font-medium">No encontramos postulaciones que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredApplications.map(app => {
              const statusConfig = getStatusConfig(app.status);
              const formattedDate = new Date(app.applied_at || Date.now()).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div
                  key={app.id}
                  onClick={() => navigate(`/projects/${app.project_id}`)}
                  className="bg-white rounded-4xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 ease-out" />

                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
                    <FileText className="h-7 w-7 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                        {app.project_title || "Proyecto sin título"}
                      </h3>
                      <Badge className={cn("px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit border", statusConfig.classes)}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {app.cover_note || "Sin nota de presentación..."}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        Postulado el {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 hidden md:flex h-12 w-12 rounded-full bg-slate-50 items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <ExternalLink className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
