import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { apiClient } from './api/api-client';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import Charts from './components/Charts';
import MLEnginePage from './pages/MLEnginePage';
import InfrastructurePage from './pages/InfrastructurePage';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
    </div>
  );
  
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && user.role === 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-inter">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  </div>
);

const OverviewContent = () => {
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
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout><OverviewContent /></DashboardLayout></ProtectedRoute>} />
      <Route path="/ml-engine" element={<ProtectedRoute><DashboardLayout><MLEnginePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/infrastructure" element={<ProtectedRoute><DashboardLayout><InfrastructurePage /></DashboardLayout></ProtectedRoute>} />
    </Routes>
  );
}
