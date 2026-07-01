import { useState } from "react";
import { Users, CheckCircle2, XCircle, Award, Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Phone, Mail, Copy } from "lucide-react";
import { Button, Badge, cn } from "@chambitas/ui";
import type { EmployerProject, ApplicationData } from "../types";

interface ApplicantsListProps {
  project: EmployerProject;
  applicants: ApplicationData[];
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  ITEMS_PER_PAGE: number;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  isProcessingId: string | null;
  isCompleting: boolean;
  handleUpdateStatus: (appId: string, status: string) => void;
  handleViewProfile: (studentId: string) => void;
  handleCompleteProject: () => void;
  handleOpenReview: (appId: string, name?: string) => void;
}

export function ApplicantsList({
  project,
  applicants,
  currentPage,
  setCurrentPage,
  ITEMS_PER_PAGE,
  openMenuId,
  setOpenMenuId,
  isProcessingId,
  isCompleting,
  handleUpdateStatus,
  handleViewProfile,
  handleCompleteProject,
  handleOpenReview,
}: ApplicantsListProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const isSelectedStatus = project.status === 'in_progress' || project.status === 'closed';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Ordenar por fecha más reciente
  const sortedApplicants = [...applicants].sort((a, b) => {
    const getUtcTime = (dateStr: string | undefined) => {
      if (!dateStr) return 0;
      const utcDateStr = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
      return new Date(utcDateStr).getTime();
    };
    return getUtcTime(b.applied_at || b.created_at) - getUtcTime(a.applied_at || a.created_at);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900">
            {isSelectedStatus ? 'Estudiante Seleccionado' : 'Postulantes'}
          </h2>
          <Badge className="bg-emerald-50 text-emerald-700 font-black px-2.5 py-0.5 rounded-md">
            {isSelectedStatus ? '1' : applicants.length}
          </Badge>
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-slate-100 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Aún no hay postulantes</h3>
          <p className="text-slate-500 font-medium mt-1">Los estudiantes que apliquen aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {(isSelectedStatus
              ? sortedApplicants.filter((a) => a.status === 'accepted')
              : sortedApplicants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            ).map((app) => {
              const dateStr = app.applied_at || app.created_at || '';
              const utcDateStr = dateStr ? (dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`) : 0;
              const isNew = (Date.now() - new Date(utcDateStr).getTime()) < 1000 * 60 * 60 * 24 * 2; // 48 horas

              return (
              <div
                key={app.id}
                className={cn(
                  "p-6 rounded-md border transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative",
                  app.status === 'accepted'
                    ? "bg-emerald-50 border-emerald-200"
                    : app.status === 'rejected'
                      ? "bg-red-50 border-red-100 opacity-60"
                      : "bg-white border-slate-100 hover:border-emerald-200 shadow-sm group"
                )}
              >
                {app.status === 'accepted' && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-md" />
                )}

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0 mt-1 sm:mt-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.student_name || app.student_id}`} alt="Avatar" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        {app.student_name || `Estudiante #${(app.student_id || '').substring(0, 5)}`}
                        {isNew && app.status === 'pending' && (
                          <Badge className="bg-blue-100 text-blue-700 font-black px-2 py-0 rounded-full text-[9px] uppercase tracking-widest shadow-none border-none animate-pulse">
                            Nuevo
                          </Badge>
                        )}
                      </h4>
                      {app.match_score ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-none text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {(app.match_score * 100).toFixed(0)}% de Coincidencia
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-50 text-slate-500 border border-slate-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-none text-xs">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculando Coincidencia IA...
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      "{app.cover_note || "Sin carta de presentación"}"
                    </p>
                    {app.status === 'accepted' && (app.student_phone || app.student_email) && (
                      <div className="mt-3 flex flex-col gap-2">
                        {app.student_phone && (
                          <div 
                            onClick={() => handleCopy(app.student_phone!)}
                            className="text-sm font-bold bg-emerald-100/50 text-emerald-800 px-3 py-1.5 rounded-md inline-flex items-center gap-2 border border-emerald-200/50 w-fit cursor-pointer hover:bg-emerald-200 transition-colors group"
                            title="Haz clic para copiar"
                          >
                            <Phone className="h-4 w-4" /> 
                            {copiedText === app.student_phone ? "¡Copiado!" : `Celular: ${app.student_phone}`}
                            <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                        )}
                        {app.student_email && (
                          <div 
                            onClick={() => handleCopy(app.student_email!)}
                            className="text-sm font-bold bg-blue-100/50 text-blue-800 px-3 py-1.5 rounded-md inline-flex items-center gap-2 border border-blue-200/50 w-fit cursor-pointer hover:bg-blue-200 transition-colors group"
                            title="Haz clic para copiar"
                          >
                            <Mail className="h-4 w-4" /> 
                            {copiedText === app.student_email ? "¡Copiado!" : `Email: ${app.student_email}`}
                            <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs font-bold text-slate-400">
                        {app.applied_at || app.created_at
                          ? (() => {
                              const dateStr = app.applied_at || app.created_at!;
                              const utcDateStr = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
                              const d = new Date(utcDateStr);
                              return `Postuló el ${d.toLocaleDateString('es-PE')} a las ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
                            })()
                          : ''}
                      </span>
                      {app.status === 'accepted' && (
                        <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aceptado
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="text-xs font-black text-red-500 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Rechazado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0 shrink-0">
                  {app.match_score !== undefined && app.match_score > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 font-black px-3 py-1 text-xs flex items-center gap-1.5 rounded-md self-start sm:self-center">
                      <Award className="h-4 w-4" /> MATCH {(app.match_score * 100).toFixed(0)}%
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      onClick={() => handleViewProfile(app.student_id || '')}
                      className="flex-1 sm:flex-none bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 cursor-pointer rounded-md shadow-none border-none"
                    >
                      Ver Perfil
                    </Button>

                    {project.status === 'in_progress' && app.status === 'accepted' && (
                      <Button
                        onClick={handleCompleteProject}
                        disabled={isCompleting}
                        className="flex-1 sm:flex-none bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold cursor-pointer rounded-md shadow-none border-none"
                      >
                        {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                        Finalizar Proyecto
                      </Button>
                    )}

                    {project.status === 'completed' && app.status === 'accepted' && (
                      <Button
                        onClick={() => handleOpenReview(app.id, app.student_name || '')}
                        className="flex-1 sm:flex-none bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold cursor-pointer rounded-md shadow-none border-none"
                      >
                        Dejar Reseña
                      </Button>
                    )}

                    {project.status !== 'in_progress' && project.status !== 'completed' && app.status === 'pending' && (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                          className="p-2 h-10 w-10 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full flex items-center justify-center border-none shadow-none bg-transparent"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>

                        {openMenuId === app.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} />
                            <div className="absolute right-0 top-full mt-2 min-w-max bg-white rounded-md shadow-md border border-slate-100 py-1.5 z-50 flex flex-col overflow-hidden">
                              <button
                                onClick={() => { setOpenMenuId(null); handleUpdateStatus(app.id, 'accepted'); }}
                                disabled={isProcessingId === app.id}
                                className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {isProcessingId === app.id ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : null}
                                Aceptar Postulante
                              </button>
                              <button
                                onClick={() => { setOpenMenuId(null); handleUpdateStatus(app.id, 'rejected'); }}
                                disabled={isProcessingId === app.id}
                                className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {isProcessingId === app.id ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : null}
                                Rechazar Postulante
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Pagination Controls */}
          {project.status !== 'in_progress' && project.status !== 'completed' && applicants.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-md border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(applicants.length / ITEMS_PER_PAGE) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "h-10 w-10 rounded-md font-bold text-sm transition-colors",
                      currentPage === i + 1
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(applicants.length / ITEMS_PER_PAGE), prev + 1))}
                disabled={currentPage === Math.ceil(applicants.length / ITEMS_PER_PAGE)}
                className="h-10 w-10 p-0 rounded-md border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
