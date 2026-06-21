import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { apiClient } from './api/api-client';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import Charts from './components/Charts';
import MLEnginePage from './pages/MLEnginePage';
import InfrastructurePage from './pages/InfrastructurePage';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiClient.getOverviewKPIs();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-inter">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Content Area */}
        <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <Routes>
              <Route path="/" element={
                <>
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center text-red-700 dark:text-red-400 mb-8">
                      <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
                      <p>Ocurrió un error al cargar las métricas. Intentando reconectar... ({error})</p>
                    </div>
                  )}
                  <KPICards data={data} isLoading={isLoading} />
                  <div className="mt-8">
                    <Charts data={data} isLoading={isLoading} />
                  </div>
                </>
              } />
              <Route path="/ml-engine" element={<MLEnginePage />} />
              <Route path="/infrastructure" element={<InfrastructurePage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
