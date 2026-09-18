import { useState } from 'react';
import { Users, Briefcase, TrendingUp, Clock, Eye, X, CheckCircle2, Database } from 'lucide-react';

interface KPICardsProps {
  data: any;
  isLoading: boolean;
}

interface ModalInfo {
  title: string;
  icon: any;
  value: string;
  description: string;
  originTable: string;
  formula: string;
  details: { label: string; val: string }[];
}

export default function KPICards({ data, isLoading }: KPICardsProps) {
  const [selectedModal, setSelectedModal] = useState<ModalInfo | null>(null);

  const openModal = (type: string) => {
    switch (type) {
      case 'students':
        setSelectedModal({
          title: 'Estudiantes Activos',
          icon: Users,
          value: `${data?.activeStudents || 0} estudiantes`,
          description: 'Muestra el número total de estudiantes registrados en la plataforma con cuenta universitaria verificada.',
          originTable: 'public.users (role = "student") & public.student_profiles',
          formula: 'COUNT(users.id) WHERE role = "student"',
          details: [
            { label: 'Cohorte Experimental (con IA pgvector)', val: `${data?.activeStudents || 0} alumnos` },
            { label: 'Cohorte Control (Búsqueda Tradicional)', val: '0 alumnos' },
            { label: 'Estado de Verificación', val: '100% perfiles activos' }
          ]
        });
        break;

      case 'liquidity':
        setSelectedModal({
          title: 'Liquidez de Mercado (Proyectos vs Aplicaciones)',
          icon: Briefcase,
          value: `${data?.totalProjects || 0} Proyectos / ${data?.totalApplications || 0} Aplicaciones`,
          description: 'Mide la densidad de demanda y oferta laboral. Compara las vacantes de microtrabajos publicadas por empleadores contra la cantidad total de postulaciones recibidas.',
          originTable: 'public.projects & public.applications',
          formula: 'COUNT(projects.id) / COUNT(applications.id)',
          details: [
            { label: 'Total Proyectos Publicados', val: `${data?.totalProjects || 0} micro-encargos` },
            { label: 'Total Postulaciones Recibidas', val: `${data?.totalApplications || 0} postulaciones` },
            { label: 'Promedio de Postulaciones por Proyecto', val: `${data?.totalProjects ? (data.totalApplications / data.totalProjects).toFixed(1) : 0} postulantes/proyecto` }
          ]
        });
        break;

      case 'economic':
        setSelectedModal({
          title: 'Impacto Económico Acumulado',
          icon: TrendingUp,
          value: `S/. ${data?.totalIncomeGenerated?.toLocaleString() || '0'}`,
          description: 'Representa la masa salarial y retribución económica directa transferida a los estudiantes por la ejecución completada o aceptada de encargos.',
          originTable: 'public.applications ➔ public.projects.budget',
          formula: 'SUM(projects.budget) WHERE application.status IN ("accepted", "completed")',
          details: [
            { label: 'Ingresos Acumulados Generados', val: `S/. ${data?.totalIncomeGenerated?.toLocaleString() || '0'}` },
            { label: 'Estudiantes Beneficiados (con Contratación)', val: `${data?.funnelData?.find((f: any) => f.step === 'Contrataciones')?.value || 0} contrataciones concretadas` },
            { label: 'Moneda de Registro', val: 'Soles Peruanos (PEN)' },
            { label: 'Impacto Directo Promedio por Alumno Activo', val: `S/. ${data?.activeStudents ? (data.totalIncomeGenerated / data.activeStudents).toFixed(0) : 0} / estudiante` }
          ]
        });
        break;

      case 'efficiency':
        setSelectedModal({
          title: 'Eficiencia de Búsqueda y Selección',
          icon: Clock,
          value: `${data?.avgTimeToHireDays?.toFixed(1) || '0.0'} días`,
          description: 'Mide el tiempo medio transcurrido entre la creación de la oferta de microtrabajo y la selección/contratación del estudiante ideal.',
          originTable: 'public.applications (created_at vs updated_at)',
          formula: 'AVG(application.updated_at - application.created_at) WHERE status = "accepted"',
          details: [
            { label: 'Tiempo Promedio hasta la Contratación', val: `${data?.avgTimeToHireDays?.toFixed(1) || 0} días` },
            { label: 'Meta de Optimización Algorítmica', val: 'Reducción de latencia ≥ 60%' },
            { label: 'Filtro de Horarios Aplicado', val: 'Validación determinista contra colisiones' }
          ]
        });
        break;

      default:
        break;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Estudiantes Activos */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e9e2] relative overflow-hidden text-[#181d19] group hover:border-[#0f6c41]/30 transition-all shadow-sm">
          <div className="text-sm font-medium text-[#414941] mb-2 flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-[#0f6c41]" />
              Estudiantes Activos
            </span>
            <button
              onClick={() => openModal('students')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#a0f5bd]/30 text-slate-600 hover:text-[#0f6c41] transition-colors cursor-pointer"
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="h-8 w-24 bg-[#d3d8d0] rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold">{data?.activeStudents?.toLocaleString()}</div>
          )}
        </div>

        {/* Liquidez */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e9e2] relative overflow-hidden text-[#181d19] group hover:border-[#0f6c41]/30 transition-all shadow-sm">
          <div className="text-sm font-medium text-[#414941] mb-2 flex items-center justify-between">
            <span className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-[#0f6c41]" />
              Liquidez (Proyectos/Apps)
            </span>
            <button
              onClick={() => openModal('liquidity')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#a0f5bd]/30 text-slate-600 hover:text-[#0f6c41] transition-colors cursor-pointer"
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="h-8 w-32 bg-[#d3d8d0] rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold">{data?.totalProjects} / {data?.totalApplications}</div>
          )}
        </div>

        {/* Impacto Económico */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e9e2] relative overflow-hidden text-[#181d19] group hover:border-[#0f6c41]/30 transition-all shadow-sm">
          <div className="text-sm font-medium text-[#414941] mb-2 flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-[#0f6c41]" />
              Impacto Económico (S/.)
            </span>
            <button
              onClick={() => openModal('economic')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#a0f5bd]/30 text-slate-600 hover:text-[#0f6c41] transition-colors cursor-pointer"
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="h-8 w-32 bg-[#d3d8d0] rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold text-[#0f6c41]">
              S/. {data?.totalIncomeGenerated?.toLocaleString()}
            </div>
          )}
        </div>

        {/* Eficiencia Búsqueda */}
        <div className="bg-white p-6 rounded-xl border border-[#e5e9e2] relative overflow-hidden text-[#181d19] group hover:border-[#0f6c41]/30 transition-all shadow-sm">
          <div className="text-sm font-medium text-[#414941] mb-2 flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-[#0f6c41]" />
              Eficiencia Búsqueda
            </span>
            <button
              onClick={() => openModal('efficiency')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#a0f5bd]/30 text-slate-600 hover:text-[#0f6c41] transition-colors cursor-pointer"
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="h-8 w-24 bg-[#d3d8d0] rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold">{data?.avgTimeToHireDays?.toFixed(1)} <span className="text-lg text-slate-400 font-normal">días</span></div>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-5">
            <button
              onClick={() => setSelectedModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-3 bg-[#a0f5bd]/30 text-[#0f6c41] rounded-xl">
                <selectedModal.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedModal.title}</h3>
                <p className="text-xs font-semibold text-[#0f6c41]">{selectedModal.value}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedModal.description}
            </p>

            <div className="bg-[#f8faf7] p-3.5 rounded-xl border border-[#0f6c41]/10 space-y-2 text-xs">
              <div className="flex items-center text-slate-700">
                <Database className="w-4 h-4 mr-2 text-[#0f6c41]" />
                <span className="font-bold mr-1">Origen DB:</span> {selectedModal.originTable}
              </div>
              <div className="flex items-center text-slate-700">
                <CheckCircle2 className="w-4 h-4 mr-2 text-[#0f6c41]" />
                <span className="font-bold mr-1">Fórmula:</span> <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-800">{selectedModal.formula}</code>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Desglose Técnico:</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {selectedModal.details.map((d, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 text-xs bg-slate-50/50">
                    <span className="text-slate-600 font-medium">{d.label}</span>
                    <span className="font-bold text-slate-900">{d.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedModal(null)}
                className="px-4 py-2 bg-[#0f6c41] text-white font-semibold text-xs rounded-xl hover:bg-[#0c5734] transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
