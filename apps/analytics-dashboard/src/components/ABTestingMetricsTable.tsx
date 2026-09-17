import React from 'react';
import { CheckCircle2, XCircle, FlaskConical, Users, Sparkles, TrendingUp } from 'lucide-react';

export interface ABMetricRow {
  metric: string;
  unit: string;
  control: number;
  experimental: number;
  targetText: string;
  isTargetMet: boolean;
}

interface ABTestingMetricsTableProps {
  metrics?: ABMetricRow[];
  isLoading?: boolean;
}

export const ABTestingMetricsTable: React.FC<ABTestingMetricsTableProps> = ({
  metrics = [],
  isLoading = false
}) => {
  // Fallback limpio para inicialización o sin datos aún registrados
  const defaultMetrics: ABMetricRow[] = [
    {
      metric: 'Muestra Total (N)',
      unit: 'estudiantes',
      control: 0,
      experimental: 0,
      targetText: '≥ 40 por cohorte',
      isTargetMet: false,
    },
    {
      metric: 'Tiempo Promedio de Búsqueda',
      unit: 'minutos',
      control: 0,
      experimental: 0,
      targetText: 'Reducción ≥ 60%',
      isTargetMet: false,
    },
    {
      metric: 'Tasa de Match Exitoso',
      unit: '%',
      control: 0,
      experimental: 0,
      targetText: 'Mejora ≥ 30%',
      isTargetMet: false,
    },
    {
      metric: 'Postulaciones con Conflicto Horario',
      unit: '%',
      control: 0,
      experimental: 0,
      targetText: 'Reducción ≤ 5%',
      isTargetMet: false,
    },
    {
      metric: 'Calificación Promedio SUS',
      unit: 'puntos',
      control: 0,
      experimental: 0,
      targetText: 'Puntaje > 80.0',
      isTargetMet: false,
    }
  ];

  const dataToRender = metrics.length > 0 ? metrics : defaultMetrics;

  const calculateDiff = (control: number, experimental: number, unit: string) => {
    if (unit === 'estudiantes') {
      const diff = experimental - control;
      return { text: `${diff > 0 ? '+' : ''}${diff}`, isPositive: diff >= 0 };
    }

    if (!control || control === 0) {
      if (experimental > 0) {
        return { text: '+100.0%', isPositive: true };
      }
      return { text: '0.0%', isPositive: true };
    }

    // Para métricas donde MENOS es mejor (Tiempo de Búsqueda y Conflictos)
    const lowerIsBetter = unit === 'minutos' || (unit === '%' && control > experimental);

    const percentChange = ((experimental - control) / control) * 100;
    const formatted = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

    return {
      text: formatted,
      isPositive: lowerIsBetter ? percentChange < 0 : percentChange > 0
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-[#0f6c41]/15 p-6 shadow-sm space-y-6">
      {/* Header del Componente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#a0f5bd]/30 rounded-xl text-[#0f6c41]">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#181d19] tracking-tight">
              Monitoreo Experimental A/B (Fase 3 y 4)
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Evaluación empírica de hipótesis entre el algoritmo de IA (pgvector) y la búsqueda tradicional.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#a0f5bd]/40 text-[#002110] border border-[#0f6c41]/20">
            <span className="w-2 h-2 rounded-full bg-[#0f6c41] animate-pulse mr-2"></span>
            Piloto En Vivo
          </span>
        </div>
      </div>

      {/* Tabla Comparativa */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3.5 px-4 rounded-l-xl">Métrica Evaluada</th>
              <th className="py-3.5 px-4">
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>Grupo Control</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal normal-case">Sin IA (Tradicional)</span>
              </th>
              <th className="py-3.5 px-4 bg-[#a0f5bd]/10">
                <div className="flex items-center space-x-1.5 text-[#0f6c41]">
                  <Sparkles className="h-4 w-4" />
                  <span>Grupo Experimental</span>
                </div>
                <span className="text-[10px] text-[#0f6c41]/70 font-normal normal-case">Con IA (pgvector)</span>
              </th>
              <th className="py-3.5 px-4">Variación (Δ)</th>
              <th className="py-3.5 px-4">Criterio de Éxito Tesis</th>
              <th className="py-3.5 px-4 text-center rounded-r-xl">Estado Meta</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="py-4 px-4 text-center"><div className="h-6 bg-slate-200 rounded-full w-20 mx-auto"></div></td>
                </tr>
              ))
            ) : (
              dataToRender.map((row, idx) => {
                const diff = calculateDiff(row.control, row.experimental, row.unit);
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {row.metric}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {row.control} <span className="text-xs text-slate-400 font-normal">{row.unit}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#0f6c41] bg-[#a0f5bd]/5">
                      {row.experimental} <span className="text-xs text-[#0f6c41]/70 font-normal">{row.unit}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${diff.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                        {diff.text}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-500">
                      {row.targetText}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.isTargetMet ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Cumplido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                          No Cumplido
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Banner Informativo de Conclusión Metodológica */}
      <div className="bg-[#f1f5ee] rounded-xl p-4 border border-[#0f6c41]/10 flex items-start space-x-3">
        <TrendingUp className="h-5 w-5 text-[#0f6c41] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-[#181d19]">
            Síntesis Estadística para el Capítulo IV (Discusión de Resultados):
          </p>
          <p>
            {dataToRender.some(r => r.experimental > 0) ? (
              <>
                Se están registrando datos reales en vivo para la cohorte <strong>Grupo Experimental</strong> (con {dataToRender.find(r => r.metric.includes('Muestra Total'))?.experimental || 0} estudiante(s) activo(s)). Las métricas acumuladas de tiempo de búsqueda, tasa de match y evaluación usabilística (SUS) se recalculan dinámicamente conforme los usuarios completan sus interacciones.
              </>
            ) : (
              <>
                Los datos acumulados de telemetría y encuestas psicométricas SUS alimentarán este reporte en tiempo real comparando la muestra control vs experimental conforme los estudiantes realicen búsquedas y postulaciones en la plataforma.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
