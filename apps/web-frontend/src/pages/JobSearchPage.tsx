import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  CheckCircle2,
  DollarSign,
  Briefcase,
  X,
  Loader2,
  Circle
} from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import { apiClient } from "../api/api-client";
import { useAuth } from "../context/AuthContext";

interface ProjectSkill {
  skill_id: string;
  skill_name: string;
  min_proficiency: number;
  mandatory: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budget_type?: "fixed" | "hourly";
  budgetType?: "fixed" | "hourly";
  company_name?: string;
  companyName?: string;
  match_score?: number;
  matchScore?: number;
  skills: (string | ProjectSkill)[];
  created_at?: string;
  service_category?: string;
  status?: "open" | "in_progress" | "closed";
}

const ITEMS_PER_PAGE = 10;

export function JobSearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States for dynamic filtering
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(5000);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ["Todos", "Desarrollo", "Diseño", "Marketing", "Escritura", "Traducción"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, recRes] = await Promise.all([
          apiClient.get("/marketplace/projects"),
          apiClient.get("/matching/recommendations/me")
        ]);
        
        const allProjects = Array.isArray(projRes.data) ? projRes.data : (projRes.data.projects || []);
        const recs = Array.isArray(recRes.data) ? recRes.data : (recRes.data.recommendations || []);
        
        setProjects(allProjects);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
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
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl font-black tracking-tighter text-emerald-600">Chambitas</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <button onClick={() => navigate("/jobs")} className="text-emerald-600 border-b-2 border-emerald-600 h-16 px-2 cursor-pointer">Buscar Empleos</button>
            <button className="hover:text-emerald-600 transition-colors cursor-pointer">Mis Tareas</button>
            <button className="hover:text-emerald-600 transition-colors cursor-pointer">Mensajes</button>
            <button onClick={() => navigate("/dashboard")} className="hover:text-emerald-600 transition-colors cursor-pointer">Panel</button>
          </div>

          <div className="flex items-center gap-4">
             <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-transform" onClick={() => navigate("/dashboard")}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" />
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-10">
        
        {recommendations.length > 0 && currentPage === 1 && (
          <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-8 md:p-12 text-white shadow-2xl transition-all hover:shadow-emerald-900/10">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-[100px]" />
            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="h-5 w-5 fill-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Match Inteligente</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Recomendados para ti</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">Basado en tu perfil, hemos encontrado <span className="text-emerald-400">{recommendations.length} proyectos</span> abiertos para postular hoy.</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-emerald-900/20 group transition-all active:scale-95">Ver coincidencias <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="border-slate-700 text-slate-300 hover:bg-slate-800 h-14 px-8 rounded-2xl font-black">Actualizar Perfil</Button>
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
              className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 font-bold transition-all text-slate-700 placeholder:text-slate-300"
            />
            {searchQuery && <X className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 hover:text-slate-600 cursor-pointer transition-colors" onClick={() => setSearchQuery("")} />}
          </div>
          <Button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-600 h-14 rounded-2xl font-black"><Filter className="h-5 w-5" /> Filtros</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className={cn("lg:col-span-3 space-y-8 sticky top-24 transition-all", showFilters ? "block" : "hidden lg:block")}>
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filtros Activos</h3>
                <button onClick={() => { setActiveCategory("Todos"); setMaxPrice(5000); setSearchQuery(""); }} className="text-[10px] font-black text-slate-400 uppercase hover:text-emerald-600 transition-colors cursor-pointer">Limpiar</button>
              </div>

              {/* Categorías */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Servicio</p>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all", activeCategory === cat ? "border-emerald-500 bg-emerald-500" : "border-slate-100 group-hover:border-emerald-200")}>{activeCategory === cat && <CheckCircle2 className="h-4 w-4 text-white" />}</div>
                      <input type="checkbox" className="hidden" checked={activeCategory === cat} onChange={() => setActiveCategory(cat)} />
                      <span className={cn("text-sm font-bold transition-colors", activeCategory === cat ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900")}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio Máximo (S/.)</p>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="50"
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] font-black text-slate-900">
                    <span>S/0</span>
                    <span className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 underline underline-offset-4">S/.{maxPrice}</span>
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
                {paginatedProjects.map(project => <JobCard key={project.id} project={project} />)}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-10">
                    <Button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} variant="outline" className="rounded-xl border-slate-100 text-slate-500 h-11 w-11 p-0 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={cn("h-11 w-11 rounded-xl text-sm font-black transition-all", currentPage === page ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900")}>{page}</button>
                      ))}
                    </div>
                    <Button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} variant="outline" className="rounded-xl border-slate-100 text-slate-500 h-11 w-11 p-0 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-16 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto"><Search className="h-8 w-8 text-slate-200" /></div>
                <div className="space-y-1"><h3 className="text-lg font-black text-slate-900">Sin coincidencias</h3><p className="text-sm font-medium text-slate-400">Prueba con otros filtros para ver más opciones.</p></div>
                <Button onClick={() => { setSearchQuery(""); setActiveCategory("Todos"); setMaxPrice(5000); }} variant="outline" className="rounded-xl font-black">Reiniciar Filtros</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function JobCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const projectId = project.id || (project as any).project_id || (project as any)._id;

  const handleNavigate = () => {
    if (projectId) navigate(`/projects/${projectId}`);
  };

  const budget = project.budget || 0;
  const isHourly = (project.budget_type || project.budgetType) === "hourly";
  const company = project.company_name || project.companyName || "Chambitas Client";
  const match = project.match_score || project.matchScore || 85;

  return (
    <div 
      onClick={handleNavigate}
      className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 hover:translate-y-[-4px] transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 transition-all duration-500" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${company}&backgroundColor=0f172a`} alt={company} />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors duration-300">{project.title}</h4>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="text-slate-900">{company}</span>
                <span>•</span>
                <span className="text-emerald-600 font-black">Abierto para postular</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-none px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-sm">
                <TrendingUp className="h-3 w-3" />
                {match}% Match
              </Badge>
              <p className="text-lg font-black text-slate-900">S/.{budget}{isHourly ? "/hr" : " Fijo"}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-50">
            <div className="flex flex-wrap gap-2">
              {(project.skills || []).slice(0, 4).map((skill, idx) => {
                const skillName = typeof skill === "string" ? skill : skill.skill_name;
                return (
                  <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-100 group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-colors">
                    {skillName}
                  </span>
                );
              })}
            </div>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                const projectId = project.id || (project as any).project_id || (project as any)._id;
                if (projectId) {
                  navigate(`/projects/${projectId}`);
                } else {
                  console.error("No project ID found", project);
                }
              }}
              className="bg-slate-900 hover:bg-emerald-600 text-white font-black px-8 h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-emerald-900/20"
            >
              Ver Detalles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
