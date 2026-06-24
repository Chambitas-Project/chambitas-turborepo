import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ChevronRight, ChevronLeft, X, Loader2 } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { apiClient } from "../api/api-client";
import { DashboardNavbar } from "../widgets/navbar/ui/DashboardNavbar";

// Types
import type { Project, Recommendation } from "../features/job-search/types";

// Components
import { RecommendationsHero } from "../features/job-search/components/RecommendationsHero";
import { JobSearchFilters, type FilterState } from "../features/job-search/components/JobSearchFilters";
import { JobCard } from "../features/job-search/components/JobCard";

const ITEMS_PER_PAGE = 10;

export function JobSearchPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // States for dynamic filtering
  const defaultFilters: FilterState = {
    category: "Todos",
    skills: [],
    minPrice: 0,
    maxPrice: 5000,
    recommended: false
  };

  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("Más Recientes");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(projects.map(p => p.service_category).filter(Boolean));
    const dynamicCats = Array.from(uniqueCategories).map(cat => ({
      label: cat as string,
      value: cat as string
    }));
    return [{ label: "Todos", value: "Todos" }, ...dynamicCats];
  }, [projects]);

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
        }

        if (recRes.status === "fulfilled") {
          const data = recRes.value.data;
          const recs = Array.isArray(data) ? data : (data.recommendations || []);
          setRecommendations(recs);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, appliedFilters, sortBy]);

  const filteredProjects = projects.filter(project => {
    const isProjectOpen = (project.status || "open").toLowerCase() === "open";
    if (!isProjectOpen) return false;

    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      appliedFilters.category === "Todos" ||
      (project.service_category || "").toLowerCase() === appliedFilters.category.toLowerCase();

    const matchesPrice = project.budget >= appliedFilters.minPrice && project.budget <= appliedFilters.maxPrice;

    const matchesSkill = appliedFilters.skills.length === 0 || appliedFilters.skills.every(skillToMatch => {
      if (!project.skills) return false;
      return project.skills.some(skill => {
        if (typeof skill === 'string') return skill.toLowerCase().includes(skillToMatch.toLowerCase());
        return skill.skill_name?.toLowerCase().includes(skillToMatch.toLowerCase());
      });
    });

    const projectId = project.id || (project as any).project_id || (project as any)._id;
    const match = recommendations.find(r => r.jobId === projectId);
    const matchesRecommended = !appliedFilters.recommended || (match && match.score > 0);

    return matchesSearch && matchesCategory && matchesPrice && matchesSkill && matchesRecommended;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "Más Recientes") {
      const dateA = new Date(a.created_at || (a as any).created || 0).getTime();
      const dateB = new Date(b.created_at || (b as any).created || 0).getTime();
      return dateB - dateA;
    }
    if (sortBy === "Mayor Match") {
      const idA = a.id || (a as any).project_id || (a as any)._id;
      const idB = b.id || (b as any).project_id || (b as any)._id;
      const matchA = recommendations.find(r => r.jobId === idA)?.score || 0;
      const matchB = recommendations.find(r => r.jobId === idB)?.score || 0;
      return matchB - matchA;
    }
    if (sortBy === "Mejor Pago") {
      return (b.budget || 0) - (a.budget || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <DashboardNavbar role="student" />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-10">
        {currentPage === 1 && (
          <RecommendationsHero recommendations={recommendations} />
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
            {searchQuery && (
              <X
                className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-600 h-12 rounded-md font-black"
          >
            <Filter className="h-5 w-5" /> Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <JobSearchFilters
            showFilters={showFilters}
            categories={categories}
            initialFilters={appliedFilters}
            onApplyFilters={(filters) => {
              setAppliedFilters(filters);
            }}
            onClearFilters={() => {
              setAppliedFilters(defaultFilters);
              setSearchQuery("");
            }}
          />

          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-bold text-slate-500">
                {loading ? "Buscando..." : <>Mostrando <span className="text-slate-900 font-black">{filteredProjects.length} proyectos</span></>}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer focus:text-emerald-600 transition-colors"
              >
                <option value="Más Recientes">Más Recientes</option>
                <option value="Mayor Match">Mayor Match</option>
                <option value="Mejor Pago">Mejor Pago</option>
              </select>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                <p className="text-slate-400 font-bold">Actualizando marketplace...</p>
              </div>
            ) : paginatedProjects.length > 0 ? (
              <div className="space-y-6">
                {paginatedProjects.map(project => {
                  const projectId = project.id || (project as any).project_id || (project as any)._id;
                  const match = recommendations.find(r => r.jobId === projectId);
                  const hasApplied = applications.some((app: any) => app.project_id === projectId);
                  return (
                    <JobCard
                      key={projectId}
                      project={project}
                      matchScore={match?.score ?? 0}
                      hasApplied={hasApplied}
                    />
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-10">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      variant="outline"
                      className="rounded-md border-slate-100 text-slate-500 h-11 w-11 p-0 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "h-11 w-11 rounded-md text-sm font-black transition-all",
                            currentPage === page ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      variant="outline"
                      className="rounded-md border-slate-100 text-slate-500 h-11 w-11 p-0 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-100 p-16 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-slate-200" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Sin coincidencias</h3>
                  <p className="text-sm font-medium text-slate-400">Prueba con otros filtros para ver más opciones.</p>
                </div>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setAppliedFilters(defaultFilters);
                  }}
                  variant="outline"
                  className="rounded-md font-black"
                >
                  Reiniciar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
