import { Users, Briefcase, TrendingUp, Clock } from 'lucide-react';

interface KPICardsProps {
  data: any;
  isLoading: boolean;
}

export default function KPICards({ data, isLoading }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Estudiantes Activos
        </div>
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        ) : (
          <div className="text-3xl font-bold">{data?.activeStudents?.toLocaleString()}</div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
          <Briefcase className="h-4 w-4 mr-2" />
          Liquidez (Proyectos/Apps)
        </div>
        {isLoading ? (
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        ) : (
          <div className="text-3xl font-bold">{data?.totalProjects} / {data?.totalApplications}</div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Impacto Económico (S/.)
        </div>
        {isLoading ? (
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        ) : (
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            S/. {data?.totalIncomeGenerated?.toLocaleString()}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Eficiencia Búsqueda
        </div>
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        ) : (
          <div className="text-3xl font-bold">{data?.avgTimeToHireDays?.toFixed(1)} <span className="text-lg text-slate-400 font-normal">días</span></div>
        )}
      </div>
    </div>
  );
}
