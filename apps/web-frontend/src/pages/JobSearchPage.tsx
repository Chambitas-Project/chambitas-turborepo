import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Zap,
  CheckCircle2,
  X,
  Loader2,
  ChevronDown,
  Building2
} from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import { apiClient } from "../api/api-client";
import { DashboardNavbar } from "../widgets/navbar/ui/DashboardNavbar";

interface ProjectSkill {
  skill_id: string;
  skill_name: string;
  min_proficiency: number;
  mandatory: boolean;
}

interface Recommendation {
  jobId: string;
  score: number;
  reason: string;
  aiMetadata: string;
  matchId: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  company_name?: string; // Por defecto no viene, lo dejamos opcional
  employer_name?: string;
  skills: (string | ProjectSkill)[];
  created_at?: string;
  service_category?: string;
  status?: "active" | "open" | "in_progress" | "closed" | "completed" | "pending" | "draft";
}

const ITEMS_PER_PAGE = 10;

export function JobSearchPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // States for dynamic filtering
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(5000);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { label: "Todos", value: "Todos" },
    { label: "Desarrollo de Software", value: "Software Development" },
    { label: "Diseño Gráfico / UX", value: "Design" },
    { label: "Marketing Digital", value: "Marketing" },
    { label: "Redacción y Traducción", value: "Writing" },
    { label: "Otro", value: "Other" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, recRes, appsRes] = await Promise.allSettled([
          apiClient.get("/marketplace/projects"),
          apiClient.get("/matching/recommendations/me"),
          apiClient.get("/marketplace/applications/my-applications")
        ]);

        if (projRes.status === "fulfilled") {
          const data = projRes.value.data;
          const allProjects = Array.isArray(data) ? data : (data.projects || []);
          setProjects(allProjects);
        } else {
          console.error("Error fetching jobs:", projRes.reason);
        }

        if (recRes.status === "fulfilled") {
          const data = recRes.value.data;
          const recs = Array.isArray(data) ? data : (data.recommendations || []);
          setRecommendations(recs);
        } else {
          console.warn("Could not fetch recommendations, possibly service is down:", recRes.reason);
        }

        if (appsRes.status === "fulfilled") {
          const data = appsRes.value.data;
          const apps = Array.isArray(data) ? data : (data.applications || []);
          setApplications(apps);
        }
      } catch (error) {
        console.error("Unexpected error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, maxPrice]);

  // Comprehensive Filtering Logic - Focus on OPEN projects
  const filteredProjects = projects.filter(project => {
    // Solo mostramos proyectos abiertos por defecto en el buscador
    const isProjectOpen = (project.status || "open").toLowerCase() === "open";
    if (!isProjectOpen) return false;

    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "Todos" ||
      (project.service_category || "").toLowerCase() === activeCategory.toLowerCase();

    const matchesPrice = project.budget <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <DashboardNavbar role="student" />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-10">

        {recommendations.length > 0 && currentPage === 1 && (
          <section className="relative overflow-hidden rounded-xl bg-[#0F172A] p-8 md:p-12 text-white shadow-xl transition-all hover:shadow-emerald-900/10">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px]" />
            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="h-5 w-5 fill-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Match Inteligente</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Recomendados para ti</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">Basado en tu perfil, hemos encontrado <span className="text-emerald-400">{recommendations.length} proyectos</span> abiertos para postular hoy.</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 h-12 rounded-md shadow-md group transition-all active:scale-95">Ver coincidencias <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="border-slate-700 text-slate-300 hover:bg-slate-800 h-12 px-8 rounded-md font-black">Actualizar Perfil</Button>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="w-full pl-14 pr-6 py-4 bg-white rounded-md border-2 border-slate-100 shadow-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 font-bold transition-all text-slate-700 placeholder:text-slate-300"
            />
            {searchQuery && <X className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 hover:text-slate-600 cursor-pointer transition-colors" onClick={() => setSearchQuery("")} />}
          </div>
          <Button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-600 h-12 rounded-md font-black"><Filter className="h-5 w-5" /> Filtros</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className={cn("lg:col-span-3 sticky top-24 transition-all", showFilters ? "block" : "hidden lg:block")}>
            <div className="space-y-6 px-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="text-xl font-black text-slate-900">Filtra tus resultados</h3>
                <button onClick={() => { setActiveCategory("Todos"); setMaxPrice(5000); setSearchQuery(""); }} className="text-[10px] font-black text-slate-400 uppercase hover:text-emerald-600 transition-colors cursor-pointer">Limpiar</button>
              </div>

              {/* Categorías */}
              <div className="space-y-4 pb-6 border-b border-slate-200">
                <div className="flex items-center justify-between cursor-pointer">
                  <p className="text-sm font-bold text-slate-900">Categorías</p>
                  <ChevronDown className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <label key={cat.value} className="flex items-center justify-between cursor-pointer group">
                      <span className={cn("text-sm transition-colors", activeCategory === cat.value ? "text-slate-900 font-black" : "text-slate-500 font-medium group-hover:text-slate-900")}>{cat.label}</span>
                      <input type="checkbox" className="hidden" checked={activeCategory === cat.value} onChange={() => setActiveCategory(cat.value)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div className="space-y-4 pb-6 border-b border-slate-200">
                <div className="flex items-center justify-between cursor-pointer">
                  <p className="text-sm font-bold text-slate-900">Precio Máximo</p>
                  <ChevronDown className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="space-y-4 pt-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>S/0</span>
                    <span className="text-emerald-700">S/.{maxPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-bold text-slate-500">{loading ? "Buscando..." : <>Mostrando <span className="text-slate-900 font-black">{filteredProjects.length} proyectos</span></>}</p>
              <select className="bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer focus:text-emerald-600 transition-colors">
                <option>Más Recientes</option>
                <option>Mayor Match</option>
                <option>Mejor Pago</option>
              </select>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /><p className="text-slate-400 font-bold">Actualizando marketplace...</p></div>
            ) : paginatedProjects.length > 0 ? (
              <div className="space-y-6">
                {paginatedProjects.map(project => {
                  const projectId = project.id || (project as any).project_id || (project as any)._id;
                  const match = recommendations.find(r => r.jobId === projectId);
                  const hasApplied = applications.some((app: any) => app.project_id === projectId);
                  return <JobCard key={projectId} project={project} matchScore={match?.score} hasApplied={hasApplied} />;
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-10">
                    <Button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} variant="outline" className="rounded-md border-slate-100 text-slate-500 h-11 w-11 p-0 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={cn("h-11 w-11 rounded-md text-sm font-black transition-all", currentPage === page ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900")}>{page}</button>
                      ))}
                    </div>
                    <Button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} variant="outline" className="rounded-md border-slate-100 text-slate-500 h-11 w-11 p-0 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-100 p-16 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto"><Search className="h-8 w-8 text-slate-200" /></div>
                <div className="space-y-1"><h3 className="text-lg font-black text-slate-900">Sin coincidencias</h3><p className="text-sm font-medium text-slate-400">Prueba con otros filtros para ver más opciones.</p></div>
                <Button onClick={() => { setSearchQuery(""); setActiveCategory("Todos"); setMaxPrice(5000); }} variant="outline" className="rounded-md font-black">Reiniciar Filtros</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function JobCard({ project, matchScore, hasApplied }: { project: Project, matchScore?: number, hasApplied?: boolean }) {
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
