import { useState } from "react";
import { Search, Filter, ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { DashboardNavbar } from "../widgets/navbar/ui/DashboardNavbar";

// Hooks
import { useJobSearch } from "../features/job-search/hooks/useJobSearch";

// Components
import { JobSearchFilters } from "../features/job-search/components/JobSearchFilters";
import { JobCard, JobCardSkeleton } from "../features/job-search/components/JobCard";

export function JobSearchPage() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    projects,
    totalCount,
    otherAreaCount,
    userCareerCategories,
    hasMoreOtherAreaProjects,
    revealOtherAreas,
    showOtherAreas,
    loading,
    categories,
    searchQuery,
    setSearchQuery,
    appliedFilters,
    setAppliedFilters,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    userSkillNames,
    testGroup,
    recommendations,
    applications,
    resetFilters
  } = useJobSearch();

  let firstOtherAreaRendered = false;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <DashboardNavbar role="student" />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-10">
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
              resetFilters();
            }}
          />

          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-bold text-slate-500">
                {loading ? "Buscando..." : <>Mostrando <span className="text-slate-900 font-black">{totalCount} proyectos</span></>}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer focus:text-emerald-600 transition-colors"
              >
                <option value="Mayor Match">Mayor Match</option>
                <option value="Más Recientes">Más Recientes</option>
                <option value="Mejor Pago">Mejor Pago</option>
              </select>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-6">
                {projects.map(project => {
                  const projectId = project.id || (project as any).project_id || (project as any)._id;
                  const match = recommendations.find(r => r.jobId === projectId);
                  const appliedApp = applications.find((app: any) => app.project_id === projectId);
                  const hasApplied = !!appliedApp;
                  const rawScore = appliedApp?.match_score ?? match?.score ?? 0;
                  const isControl = testGroup === 'CONTROL';

                  const isProjectInArea = userCareerCategories.some(cat =>
                    (project.service_category || "").toLowerCase() === cat.toLowerCase()
                  );

                  const showDivider = showOtherAreas && !isProjectInArea && !firstOtherAreaRendered;
                  if (showDivider) {
                    firstOtherAreaRendered = true;
                  }

                  return (
                    <div key={projectId} className="space-y-6">
                      {showDivider && (
                        <div className="flex items-center gap-4 py-4 my-2">
                          <div className="h-px bg-slate-200 flex-1" />
                          <span className="text-xs font-black tracking-wider text-slate-400 uppercase bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
                            Oportunidades de otras áreas
                          </span>
                          <div className="h-px bg-slate-200 flex-1" />
                        </div>
                      )}
                      <JobCard
                        project={project}
                        matchScore={isControl ? undefined : rawScore}
                        hasApplied={hasApplied}
                        userSkillNames={userSkillNames}
                      />
                    </div>
                  );
                })}

                {/* Discovery Banner for Jobs Outside Student's Primary Area (Only on Last Page) */}
                {hasMoreOtherAreaProjects && currentPage === totalPages && (
                  <div className="bg-linear-to-r from-emerald-50/80 via-teal-50/50 to-white rounded-[20px] p-6 shadow-xs border-2 border-emerald-100 space-y-4 my-8 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0 mt-0.5 border border-emerald-200/50">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900 text-base">¿Deseas explorar más oportunidades?</h4>
                          <p className="text-slate-600 text-sm font-medium leading-relaxed">
                            Hemos encontrado <span className="text-emerald-600 font-bold">{otherAreaCount} resultados más</span> de otras categorías que podrían interesarte.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          revealOtherAreas();
                        }}
                        className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-11 rounded-xl shadow-sm hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        Ver otros empleos fuera de tu área ({otherAreaCount})
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-6">
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
                  onClick={resetFilters}
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
