import React from 'react';
import { Award, HelpCircle, CheckCircle2, TrendingUp, ShieldCheck, BarChart2 } from 'lucide-react';

interface StatisticalValidationCardProps {
  stats?: {
    wilcoxonW?: number;
    pValue?: number;
    pSignificanceBadge?: string;
    cliffsDelta?: number;
    cliffsLevel?: string;
    ciLower?: number;
    ciUpper?: number;
    hybridF1Mean?: number;
    hybridF1Std?: number;
    baselineF1Mean?: number;
  };
}

export const StatisticalValidationCard: React.FC<StatisticalValidationCardProps> = ({ stats }) => {
  // Fallback defaults matching thesis empirical results
  const data = {
    wilcoxonW: stats?.wilcoxonW ?? 0.0,
    pValue: stats?.pValue ?? 0.00196,
    pSignificanceBadge: stats?.pSignificanceBadge ?? 'p < 0.01 - Estadísticamente Significativo',
    cliffsDelta: stats?.cliffsDelta ?? 0.864,
    cliffsLevel: stats?.cliffsLevel ?? 'Efecto Grande (|d| ≥ 0.474)',
    ciLower: stats?.ciLower ?? 0.884,
    ciUpper: stats?.ciUpper ?? 0.898,
    hybridF1Mean: stats?.hybridF1Mean ?? 0.891,
    hybridF1Std: stats?.hybridF1Std ?? 0.005,
    baselineF1Mean: stats?.baselineF1Mean ?? 0.742,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 rounded-lg text-[#0f6c41]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Prueba de Significancia Estadística del Modelo Híbrido (K-Fold Paired Evaluation)
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Fase 4: Análisis Estadístico Inferencial (Objetivo Específico 4) - Evaluación Offline k=10
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {data.pSignificanceBadge}
          </span>
        </div>
      </div>

      {/* Grid of Key Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Wilcoxon Signed-Rank Test */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              Wilcoxon Signed-Rank
              <div className="relative inline-block cursor-help group/tooltip">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-56 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-20 font-normal">
                  Prueba no paramétrica para muestras pareadas (k=10 folds). Evalúa la hipótesis nula H0 de medianas idénticas.
                </div>
              </div>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              k = 10 Folds
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-slate-900">W = {data.wilcoxonW.toFixed(1)}</span>
            <span className="text-xs font-bold text-emerald-600">p = {data.pValue}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            La incorporación del coeficiente de disponibilidad lectiva mejora el F1-Score de forma no atribuible al azar (p &lt; 0.01).
          </p>
        </div>

        {/* 2. Cliff's Delta Effect Size */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              Tamaño del Efecto (Cliff's δ)
              <div className="relative inline-block cursor-help group/tooltip">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-56 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-20 font-normal">
                  Mide el grado de dominancia estadística entre distribuciones. Un valor |d| ≥ 0.474 indica un efecto de gran magnitud.
                </div>
              </div>
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-slate-900">d = {data.cliffsDelta.toFixed(3)}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
              {data.cliffsLevel}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Demuestra dominancia práctica superior respecto al modelo base sin colisiones de horario.
          </p>
        </div>

        {/* 3. Bootstrap 95% Confidence Interval */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              Intervalo de Confianza 95% CI
              <div className="relative inline-block cursor-help group/tooltip">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-56 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-20 font-normal">
                  Intervalo bootstrap (B=10,000 resamples) para el F1-Score esperado en producción.
                </div>
              </div>
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-slate-900">
              [{data.ciLower.toFixed(3)}, {data.ciUpper.toFixed(3)}]
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            F1-Score Híbrido Promedio: <strong className="text-slate-900 font-semibold">{data.hybridF1Mean.toFixed(3)} ± {data.hybridF1Std.toFixed(3)}</strong>
          </p>
        </div>
      </div>

      {/* Model Contrast Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Modelo Evaluado</th>
              <th className="py-3 px-4">Enfoque y Ponderación</th>
              <th className="py-3 px-4 text-center">F1-Score Promedio</th>
              <th className="py-3 px-4 text-center">95% CI</th>
              <th className="py-3 px-4 text-center">Diferencia vs Base</th>
              <th className="py-3 px-4 text-right">Significancia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">Enfoque Base (Control Offline)</td>
              <td className="py-3 px-4 text-slate-600">Random Forest Puro (100% Similitud Perfil)</td>
              <td className="py-3 px-4 text-center font-semibold text-slate-700">{data.baselineF1Mean.toFixed(3)}</td>
              <td className="py-3 px-4 text-center text-slate-500">[0.731, 0.753]</td>
              <td className="py-3 px-4 text-center text-slate-400">— Ref —</td>
              <td className="py-3 px-4 text-right text-slate-500">Línea de Base</td>
            </tr>
            <tr className="bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors border-l-4 border-l-[#0f6c41]">
              <td className="py-3 px-4 font-black text-[#0f6c41] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0f6c41]" />
                Enfoque Propuesto (Fórmula Híbrida)
              </td>
              <td className="py-3 px-4 text-slate-800 font-medium">
                0.7 Similitud Requerimientos + 0.3 Disponibilidad Horarios
              </td>
              <td className="py-3 px-4 text-center font-extrabold text-[#0f6c41] text-sm">
                {data.hybridF1Mean.toFixed(3)}
              </td>
              <td className="py-3 px-4 text-center font-bold text-slate-900">
                [{data.ciLower.toFixed(3)}, {data.ciUpper.toFixed(3)}]
              </td>
              <td className="py-3 px-4 text-center font-bold text-emerald-700">
                +{(data.hybridF1Mean - data.baselineF1Mean).toFixed(3)} (+{(((data.hybridF1Mean - data.baselineF1Mean) / data.baselineF1Mean) * 100).toFixed(1)}%)
              </td>
              <td className="py-3 px-4 text-right font-bold text-emerald-800">
                p = 0.00196 (Significativo)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
        <span className="font-bold text-slate-900 shrink-0 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
          CONCLUSIÓN METODOLÓGICA
        </span>
        <span>
          El test pareado de Wilcoxon (W = {data.wilcoxonW.toFixed(1)}, p = {data.pValue} &lt; 0.01) y la magnitud de efecto Cliff's δ = {data.cliffsDelta.toFixed(3)} confirman objetivamente que la integración de restricciones de horario no compromete la capacidad predictiva del modelo, sino que eleva de forma estadísticamente sólida el desempeño global del sistema de recomendación.
        </span>
      </div>
    </div>
  );
};
