import { useState, useEffect } from 'react';
import { apiClient } from '../api/api-client';
import { ABTestingMetricsTable } from '../components/ABTestingMetricsTable';
import { Loader2 } from 'lucide-react';

export function ABTestingPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchABMetrics() {
      try {
        setLoading(true);
        const data = await apiClient.getABTestingKPIs();
        setMetrics(data.metrics || []);
      } catch (err) {
        console.error('Error fetching AB testing metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchABMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181d19] tracking-tight">
            Monitoreo Experimental A/B (Fase 3 y 4)
          </h1>
          <p className="text-sm font-medium text-[#414941]">
            Validación de hipótesis de tesis: Algoritmo Inteligente vs Búsqueda Tradicional por Cohorte.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 w-full flex items-center justify-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="h-8 w-8 text-[#0f6c41] animate-spin" />
        </div>
      ) : (
        <ABTestingMetricsTable metrics={metrics} isLoading={false} />
      )}
    </div>
  );
}

export default ABTestingPage;
