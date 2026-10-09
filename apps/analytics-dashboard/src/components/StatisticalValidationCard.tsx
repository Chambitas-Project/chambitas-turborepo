import React from 'react';
import { Award, HelpCircle, CheckCircle2, TrendingUp, ShieldCheck, BarChart2, Eye } from 'lucide-react';

interface ColumnHeaderWithHelpProps {
  label: string;
  tooltipTitle: string;
  tooltipText: string;
  align?: 'left' | 'center' | 'right';
  tooltipAlign?: 'left' | 'center' | 'right';
}

const ColumnHeaderWithHelp: React.FC<ColumnHeaderWithHelpProps> = ({
  label,
  tooltipTitle,
  tooltipText,
  align = 'left',
  tooltipAlign = 'center',
}) => {
  const alignClass =
    align === 'center'
      ? 'justify-center text-center'
      : align === 'right'
      ? 'justify-end text-right'
      : 'justify-start text-left';

  const tooltipPositionClass =
    tooltipAlign === 'left'
      ? 'left-0'
      : tooltipAlign === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div className={`inline-flex items-center gap-1.5 ${alignClass} w-full`}>
      <span>{label}</span>
      <div className="relative inline-flex items-center group/col-tooltip cursor-pointer">
        <button
          type="button"
          aria-label={`Explicación de ${label}`}
          className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-200/80 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <div
          className={`absolute top-full mt-1.5 ${tooltipPositionClass} hidden group-hover/col-tooltip:block group-focus-within/col-tooltip:block w-64 sm:w-72 p-2.5 bg-slate-900/95 backdrop-blur-sm text-slate-200 text-[11px] rounded-lg shadow-2xl border border-slate-700 z-50 font-normal normal-case tracking-normal leading-relaxed text-left pointer-events-none`}
        >
          <div className="font-bold text-emerald-400 text-xs mb-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{tooltipTitle}</span>
          </div>
          <div className="text-slate-300 leading-normal">{tooltipText}</div>
        </div>
      </div>
    </div>
  );
};

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
    cliffsDelta: stats?.cliffsDelta ?? 1.000,
    cliffsLevel: stats?.cliffsLevel ?? 'Efecto Grande (|d| ≥ 0.474)',
    ciLower: stats?.ciLower ?? 0.887,
    ciUpper: stats?.ciUpper ?? 0.892,
    hybridF1Mean: stats?.hybridF1Mean ?? 0.889,
    hybridF1Std: stats?.hybridF1Std ?? 0.003,
    baselineF1Mean: stats?.baselineF1Mean ?? 0.713,
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
                Fase 4: Análisis Estadístico Inferencial (Objetivo Específico 4) - Evaluación Offline k=5 Folds
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
                  Prueba no paramétrica para muestras pareadas (k=5 folds). Evalúa la hipótesis nula H0 de medianas idénticas entre C4 y C3.
                </div>
              </div>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              k = 5 Folds
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-slate-900">W = {data.wilcoxonW.toFixed(1)}</span>
            <span className="text-xs font-bold text-emerald-600">p = {data.pValue}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            La incorporación del coeficiente de disponibilidad horaria mejora el F1-Score de forma no atribuible al azar (p &lt; 0.01).
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
            Demuestra dominancia práctica superior del híbrido en todas las particiones del dataset.
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
                  Intervalo bootstrap (B=1,000 resamples) para el F1-Score esperado en producción.
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

      {/* Model Contrast Comparison Table (Estudio de Ablación - Tabla IV del Paper) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Estudio de Ablación Experimental por Capas Algorítmicas (Tabla IV del Paper)
          </h4>
          <span className="text-[11px] font-medium text-slate-500">
            Dataset Empírico N = 5,000 (5-Fold Stratified CV)
          </span>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">
                  <ColumnHeaderWithHelp
                    label="Configuración / Modelo"
                    tooltipTitle="Configuración & Modelo Evaluado"
                    tooltipText="Variante arquitectural evaluada en el estudio de ablación (C1 a C4). Permite aislar y cuantificar empíricamente el aporte específico de cada componente algorítmico al ser removido o añadido."
                    align="left"
                    tooltipAlign="left"
                  />
                </th>
                <th className="py-3 px-4">
                  <ColumnHeaderWithHelp
                    label="Pipeline Algorítmico & Ponderación"
                    tooltipTitle="Pipeline Algorítmico & Ponderación"
                    tooltipText="Estrategia de recuperación y fórmula de scoring empleada: desde búsqueda textual booleana (C1) hasta la combinación lineal híbrida con hiperparámetros α = 0.7 (similitud semántica de competencias) y β = 0.3 (compatibilidad horaria)."
                    align="left"
                    tooltipAlign="left"
                  />
                </th>
                <th className="py-3 px-4 text-center">
                  <ColumnHeaderWithHelp
                    label="F1-Score (Mean ± SD)"
                    tooltipTitle="F1-Score (Promedio ± Desviación)"
                    tooltipText="Media armónica entre Precisión (relevancia de recomendaciones) y Recall (exhaustividad en cobertura de vacantes), expresada como la media muestral ± su desviación estándar a lo largo de k = 5 particiones (Stratified K-Fold CV)."
                    align="center"
                    tooltipAlign="center"
                  />
                </th>
                <th className="py-3 px-4 text-center">
                  <ColumnHeaderWithHelp
                    label="95% CI"
                    tooltipTitle="Intervalo de Confianza al 95%"
                    tooltipText="Intervalo de confianza empírico obtenido mediante remuestreo no paramétrico Bootstrap (B = 1,000 réplicas). Garantiza con un 95% de certeza estadística el rango en el cual oscila el verdadero rendimiento poblacional del modelo."
                    align="center"
                    tooltipAlign="center"
                  />
                </th>
                <th className="py-3 px-4 text-center">
                  <ColumnHeaderWithHelp
                    label="Ganancia (ΔF1)"
                    tooltipTitle="Ganancia Incremental (ΔF1)"
                    tooltipText="Diferencia de rendimiento absoluto (ΔF1 = F1_modelo - F1_base) y mejora porcentual relativa frente al baseline predecesor. Cuantifica el salto de calidad aportado al incorporar cada subsistema."
                    align="center"
                    tooltipAlign="right"
                  />
                </th>
                <th className="py-3 px-4 text-right">
                  <ColumnHeaderWithHelp
                    label="Significancia"
                    tooltipTitle="Significancia & Validación Inferencial"
                    tooltipText="Evaluación de hipótesis estadística mediante la prueba no paramétrica pareada de Wilcoxon Signed-Rank (p < 0.01) y tamaño de efecto Cliff's δ = 1.000, certificando que la superioridad del modelo propuesto no es producto del azar muestral."
                    align="right"
                    tooltipAlign="right"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {/* C1: Exact Keyword Matching */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">
                  <span className="inline-block px-1.5 py-0.5 mr-1.5 text-[10px] font-black rounded bg-slate-200 text-slate-700">C1</span>
                  Exact Keyword Matching
                </td>
                <td className="py-3 px-4 text-slate-600">SQL Text Pattern Search (`LIKE`/`ILIKE` sin embeddings)</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-700">0.548 ± 0.025</td>
                <td className="py-3 px-4 text-center text-slate-500">[0.527, 0.570]</td>
                <td className="py-3 px-4 text-center text-slate-400">— Ref Control —</td>
                <td className="py-3 px-4 text-right text-slate-500">Baseline 1</td>
              </tr>

              {/* C2: TF-IDF + SVD */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">
                  <span className="inline-block px-1.5 py-0.5 mr-1.5 text-[10px] font-black rounded bg-slate-200 text-slate-700">C2</span>
                  TF-IDF + Truncated SVD + Cosine
                </td>
                <td className="py-3 px-4 text-slate-600">Similitud Vectorial Semántica Pura (β = 0, sin horarios)</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-700">0.782 ± 0.019</td>
                <td className="py-3 px-4 text-center text-slate-500">[0.767, 0.801]</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">+0.234 (+42.7%)</td>
                <td className="py-3 px-4 text-right text-slate-600">Baseline 2</td>
              </tr>

              {/* C3: SVD + pgvector */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">
                  <span className="inline-block px-1.5 py-0.5 mr-1.5 text-[10px] font-black rounded bg-slate-200 text-slate-700">C3</span>
                  SVD + Indexación HNSW (`pgvector`)
                </td>
                <td className="py-3 px-4 text-slate-600">Búsqueda A-KNN en BD con filtro duro de competencias</td>
                <td className="py-3 px-4 text-center font-semibold text-slate-700">{data.baselineF1Mean.toFixed(3)} ± 0.031</td>
                <td className="py-3 px-4 text-center text-slate-500">[0.686, 0.743]</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">+0.165 (+30.1%)</td>
                <td className="py-3 px-4 text-right text-slate-600">pgvector ANN</td>
              </tr>

              {/* C4: Proposed Framework */}
              <tr className="bg-emerald-50/50 hover:bg-emerald-50/80 transition-colors border-l-4 border-l-[#0f6c41]">
                <td className="py-3 px-4 font-black text-[#0f6c41]">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-black rounded bg-emerald-200/80 text-emerald-900">C4</span>
                    <BarChart2 className="w-4 h-4 text-[#0f6c41]" />
                    <span>Propuesto: Híbrido Semántico-Temporal</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-800 font-medium">
                  0.7 Similitud Requerimientos + 0.3 Disponibilidad Horaria (β = 0.3)
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-[#0f6c41] text-sm">
                  {data.hybridF1Mean.toFixed(3)} ± {data.hybridF1Std.toFixed(3)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-900">
                  [{data.ciLower.toFixed(3)}, {data.ciUpper.toFixed(3)}]
                </td>
                <td className="py-3 px-4 text-center font-black text-emerald-700">
                  +{(data.hybridF1Mean - data.baselineF1Mean).toFixed(3)} (+{(((data.hybridF1Mean - data.baselineF1Mean) / data.baselineF1Mean) * 100).toFixed(1)}% vs C3)
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-800">
                  p = 0.00196 (Significativo)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
        <span className="font-bold text-slate-900 shrink-0 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
          CONCLUSIÓN METODOLÓGICA
        </span>
        <span>
          El test pareado de Wilcoxon (W = {data.wilcoxonW.toFixed(1)}, p = {data.pValue} &lt; 0.01) y la magnitud de efecto Cliff's δ = {data.cliffsDelta.toFixed(3)} confirman objetivamente que la integración de restricciones de horario (C4) supera a las capas predecesoras (C1 exact keyword, C2 semántico puro y C3 pgvector sin horarios), elevando de forma estadísticamente sólida el desempeño global del sistema de recomendación.
        </span>
      </div>
    </div>
  );
};
